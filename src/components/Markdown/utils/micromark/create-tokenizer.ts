import createDebug from "debug";
import { ok as assert } from "devlop";
import { markdownLineEnding } from "micromark-util-character";
import { push, splice } from "micromark-util-chunked";
import { resolveAll } from "micromark-util-resolve-all";
import { codes, values } from "micromark-util-symbol";
import type {
    Chunk,
    Code,
    Construct,
    ConstructRecord,
    Effects,
    Event,
    InitialConstruct,
    ParseContext,
    Point,
    State,
    Token,
    TokenizeContext,
    TokenType,
} from "micromark-util-types";

export type Restore = () => void;
interface Info {
    restore: Restore;
    from: number;
}
export type ReturnHandle = (construct: Construct, info: Info) => void;

const debug = createDebug("micromark");

type PickedToken = Pick<Token, "end" | "start">;

/**
 * Create a tokenizer.
 * Tokenizers deal with one type of data (e.g., containers, flow, text).
 * The parser is the object dealing with it all.
 * `initialize` works like other constructs, except that only its `tokenize`
 * function is used, in which case it doesn’t receive an `ok` or `nok`.
 * `from` can be given to set the point before the first character, although
 * when further lines are indented, they must be set with `defineSkip`.
 *
 */
export function createTokenizer(
    parser: ParseContext,
    initialize: InitialConstruct,
    from: Omit<Point, "_bufferIndex" | "_index"> | undefined,
): TokenizeContext {
    let point: Point = {
        _bufferIndex: -1,
        _index: 0,
        line: (from && from.line) || 1,
        column: (from && from.column) || 1,
        offset: (from && from.offset) || 0,
    };
    const columnStart: Record<string, number> = {};
    const resolveAllConstructs: Construct[] = [];
    let chunks: Chunk[] = [];
    let stack: Token[] = [];
    let consumed: boolean | undefined = true;

    /**
     * Tools used for tokenizing.
     *
     */
    const effects: Effects = {
        attempt: constructFactory(onsuccessfulconstruct),
        check: constructFactory(onsuccessfulcheck),
        consume,
        enter,
        exit,
        interrupt: constructFactory(onsuccessfulcheck, { interrupt: true }),
    };

    /**
     * State and tools for resolving and serializing.
     *
     */
    const context: TokenizeContext = {
        code: codes.eof,
        containerState: {},
        defineSkip,
        events: [],
        now,
        parser,
        previous: codes.eof,
        sliceSerialize,
        sliceStream,
        write,
    };

    /**
     * The state function.
     *
     */
    let state: State | undefined = initialize.tokenize.call(context, effects);

    /**
     * Track which character we expect to be consumed, to catch bugs.
     *
     */
    let expectedCode: Code;

    if (initialize.resolveAll) {
        resolveAllConstructs.push(initialize);
    }

    return context;

    function write(slice: Chunk[]): Event[] {
        chunks = push(chunks, slice);

        main();

        // Exit if we’re not done, resolve might change stuff.
        if (chunks[chunks.length - 1] !== codes.eof) {
            return [];
        }

        addResult(initialize, 0);

        // Otherwise, resolve, and exit.
        context.events = resolveAll(
            resolveAllConstructs,
            context.events,
            context,
        );

        return context.events;
    }

    //
    // Tools.
    //

    function sliceSerialize(
        token: PickedToken,
        expandTabs: boolean | undefined,
    ): string {
        return serializeChunks(sliceStream(token), expandTabs);
    }

    function sliceStream(token: PickedToken): Chunk[] {
        return sliceChunks(chunks, token);
    }

    function now(): Point {
        // This is a hot path, so we clone manually instead of `Object.assign({}, point)`
        const { _bufferIndex, _index, line, column, offset } = point;
        return { _bufferIndex, _index, line, column, offset };
    }

    function defineSkip(point: Point): undefined {
        columnStart[point.line] = point.column;
        accountForPotentialSkip();
        debug("position: define skip: `%j`", point);
    }

    //
    // State management.
    //

    /**
     * Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
     * `consume`).
     * Here is where we walk through the chunks, which either include strings of
     * several characters, or numerical character codes.
     * The reason to do this in a loop instead of a call is so the stack can
     * drain.
     */
    function main(): undefined {
        let chunkIndex: number;

        while (point._index < chunks.length) {
            const chunk = chunks[point._index];

            // If we’re in a buffer chunk, loop through it.
            if (typeof chunk === "string") {
                chunkIndex = point._index;

                if (point._bufferIndex < 0) {
                    point._bufferIndex = 0;
                }

                while (
                    point._index === chunkIndex &&
                    point._bufferIndex < chunk.length
                ) {
                    go(chunk.charCodeAt(point._bufferIndex));
                }
            } else {
                go(chunk);
            }
        }
    }

    /**
     * Deal with one code.
     */
    function go(code: Code): undefined {
        assert(consumed === true, "expected character to be consumed");
        consumed = undefined;
        debug("main: passing `%s` to %s", code, state && state.name);
        expectedCode = code;
        assert(typeof state === "function", "expected state");
        state = state(code);
    }

    function consume(code: Code): undefined {
        assert(
            code === expectedCode,
            "expected given code to equal expected code",
        );

        debug("consume: `%s`", code);

        assert(
            consumed === undefined,
            "expected code to not have been consumed: this might be because `return x(code)` instead of `return x` was used",
        );
        assert(
            code === null
                ? context.events.length === 0 ||
                      context.events[context.events.length - 1][0] === "exit"
                : context.events[context.events.length - 1][0] === "enter",
            "expected last token to be open",
        );

        if (markdownLineEnding(code)) {
            point.line++;
            point.column = 1;
            point.offset += code === codes.carriageReturnLineFeed ? 2 : 1;
            accountForPotentialSkip();
            debug("position: after eol: `%j`", point);
        } else if (code !== codes.virtualSpace) {
            point.column++;
            point.offset++;
        }

        // Not in a string chunk.
        if (point._bufferIndex < 0) {
            point._index++;
        } else {
            point._bufferIndex++;

            // At end of string chunk.
            if (
                point._bufferIndex ===
                // Points w/ non-negative `_bufferIndex` reference
                // strings.
                // @ts-expect-error `_bufferIndex` is used on string chunks.
                chunks[point._index].length
            ) {
                point._bufferIndex = -1;
                point._index++;
            }
        }

        // Expose the previous character.
        context.previous = code;

        // Mark as consumed.
        consumed = true;
    }

    function enter(
        type: TokenType,
        fields: Omit<Partial<Token>, "type"> | undefined,
    ): Token {
        // @ts-expect-error Patch instead of assign required fields to help GC.
        const token: Token = fields || {};
        token.type = type;
        token.start = now();

        assert(typeof type === "string", "expected string type");
        assert(type.length > 0, "expected non-empty string");
        debug("enter: `%s`", type);

        context.events.push(["enter", token, context]);

        stack.push(token);

        return token;
    }

    function exit(type: TokenType): Token {
        assert(typeof type === "string", "expected string type");
        assert(type.length > 0, "expected non-empty string");

        const token = stack.pop();
        assert(token, "cannot close w/o open tokens");
        token.end = now();

        assert(
            type === token.type,
            "expected exit token to match current token",
        );

        assert(
            !(
                token.start._index === token.end._index &&
                token.start._bufferIndex === token.end._bufferIndex
            ),
            "expected non-empty token (`" + type + "`)",
        );

        debug("exit: `%s`", token.type);
        context.events.push(["exit", token, context]);

        return token;
    }

    /**
     * Use results.
     */
    function onsuccessfulconstruct(construct: Construct, info: Info) {
        addResult(construct, info.from);
    }

    /**
     * Discard results.
     *
     */
    function onsuccessfulcheck(_: Construct, info: Info) {
        info.restore();
    }

    /**
     * Factory to attempt/check/interrupt.
     */
    function constructFactory(
        onreturn: ReturnHandle,
        fields?: { interrupt?: boolean | undefined } | undefined,
    ) {
        return hook;

        /**
         * Handle either an object mapping codes to constructs, a list of
         * constructs, or a single construct.
         */
        function hook(
            constructs: Construct[] | ConstructRecord | Construct,
            returnState: State,
            bogusState: State | undefined,
        ): State {
            let listOfConstructs: readonly Construct[];
            let constructIndex: number;
            let currentConstruct: Construct;
            let info: Info;

            return Array.isArray(constructs)
                ? /* c8 ignore next 1 */
                  handleListOfConstructs(constructs)
                : "tokenize" in constructs
                  ? // Looks like a construct.
                    handleListOfConstructs([constructs as Construct])
                  : handleMapOfConstructs(constructs);

            /**
             * Handle a list of construct.
             */
            function handleMapOfConstructs(map: ConstructRecord): State {
                return start;

                function start(code: Code) {
                    const left = code !== null && map[code];
                    const all = code !== null && map.null;
                    const list = [
                        // To do: add more extension tests.
                        /* c8 ignore next 2 */
                        ...(Array.isArray(left) ? left : left ? [left] : []),
                        ...(Array.isArray(all) ? all : all ? [all] : []),
                    ];

                    return handleListOfConstructs(list)(code);
                }
            }

            /**
             * Handle a list of construct.
             *
             */
            function handleListOfConstructs(list: readonly Construct[]): State {
                listOfConstructs = list;
                constructIndex = 0;

                if (list.length === 0) {
                    assert(bogusState, "expected `bogusState` to be given");
                    return bogusState;
                }

                return handleConstruct(list[constructIndex]);
            }

            /**
             * Handle a single construct.
             */
            function handleConstruct(construct: Construct): State {
                return start;

                function start(code: Code) {
                    // To do: not needed to store if there is no bogus state, probably?
                    // Currently doesn’t work because `inspect` in document does a check
                    // w/o a bogus, which doesn’t make sense. But it does seem to help perf
                    // by not storing.
                    info = store();
                    currentConstruct = construct;

                    if (!construct.partial) {
                        context.currentConstruct = construct;
                    }

                    // Always populated by defaults.
                    assert(
                        context.parser.constructs.disable.null,
                        "expected `disable.null` to be populated",
                    );

                    if (
                        construct.name &&
                        context.parser.constructs.disable.null.includes(
                            construct.name,
                        )
                    ) {
                        return nok(code);
                    }

                    return construct.tokenize.call(
                        // If we do have fields, create an object w/ `context` as its
                        // prototype.
                        // This allows a “live binding”, which is needed for `interrupt`.
                        fields
                            ? Object.assign(Object.create(context), fields)
                            : context,
                        effects,
                        ok,
                        nok,
                    )(code);
                }
            }

            function ok(code: Code) {
                assert(code === expectedCode, "expected code");
                consumed = true;
                onreturn(currentConstruct, info);
                return returnState;
            }

            function nok(code: Code) {
                assert(code === expectedCode, "expected code");
                consumed = true;
                info.restore();

                if (++constructIndex < listOfConstructs.length) {
                    return handleConstruct(listOfConstructs[constructIndex]);
                }

                return bogusState;
            }
        }
    }

    function addResult(construct: Construct, from: number): undefined {
        if (construct.resolveAll && !resolveAllConstructs.includes(construct)) {
            resolveAllConstructs.push(construct);
        }

        if (construct.resolve) {
            splice(
                context.events,
                from,
                context.events.length - from,
                construct.resolve(context.events.slice(from), context),
            );
        }

        if (construct.resolveTo) {
            context.events = construct.resolveTo(context.events, context);
        }

        assert(
            construct.partial ||
                context.events.length === 0 ||
                context.events[context.events.length - 1][0] === "exit",
            "expected last token to end",
        );
    }

    /**
     * Store state.
     *
     */
    function store(): Info {
        const startPoint = now();
        const startPrevious = context.previous;
        const startCurrentConstruct = context.currentConstruct;
        const startEventsIndex = context.events.length;
        const startStack = Array.from(stack);

        return { from: startEventsIndex, restore };

        /**
         * Restore state.
         */
        function restore(): undefined {
            point = startPoint;
            context.previous = startPrevious;
            context.currentConstruct = startCurrentConstruct;
            context.events.length = startEventsIndex;
            stack = startStack;
            accountForPotentialSkip();
            debug("position: restore: `%j`", point);
        }
    }

    /**
     * Move the current point a bit forward in the line when it’s on a column
     * skip.
     */
    function accountForPotentialSkip(): undefined {
        if (point.line in columnStart && point.column < 2) {
            point.column = columnStart[point.line];
            point.offset += columnStart[point.line] - 1;
        }
    }
}

/**
 * Get the chunks from a slice of chunks in the range of a token.
 */
function sliceChunks(
    chunks: readonly Chunk[],
    token: Pick<Token, "end" | "start">,
): Chunk[] {
    const startIndex = token.start._index;
    const startBufferIndex = token.start._bufferIndex;
    const endIndex = token.end._index;
    const endBufferIndex = token.end._bufferIndex;
    let view: Chunk[];

    if (startIndex === endIndex) {
        assert(endBufferIndex > -1, "expected non-negative end buffer index");
        assert(
            startBufferIndex > -1,
            "expected non-negative start buffer index",
        );
        // @ts-expect-error `_bufferIndex` is used on string chunks.
        view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
    } else {
        view = chunks.slice(startIndex, endIndex);

        if (startBufferIndex > -1) {
            const head = view[0];
            if (typeof head === "string") {
                view[0] = head.slice(startBufferIndex);
                /* c8 ignore next 4 -- used to be used, no longer */
            } else {
                assert(
                    startBufferIndex === 0,
                    "expected `startBufferIndex` to be `0`",
                );
                view.shift();
            }
        }

        if (endBufferIndex > 0) {
            // @ts-expect-error `_bufferIndex` is used on string chunks.
            view.push(chunks[endIndex].slice(0, endBufferIndex));
        }
    }

    return view;
}

/**
 * Get the string value of a slice of chunks.
 */
function serializeChunks(
    chunks: readonly Chunk[],
    expandTabs: boolean | undefined,
): string {
    let index = -1;
    const result: string[] = [];
    let atTab: boolean | undefined;

    while (++index < chunks.length) {
        const chunk = chunks[index];
        let value: string;

        if (typeof chunk === "string") {
            value = chunk;
        } else
            switch (chunk) {
                case codes.carriageReturn: {
                    value = values.cr;

                    break;
                }

                case codes.lineFeed: {
                    value = values.lf;

                    break;
                }

                case codes.carriageReturnLineFeed: {
                    value = values.cr + values.lf;

                    break;
                }

                case codes.horizontalTab: {
                    value = expandTabs ? values.space : values.ht;

                    break;
                }

                case codes.virtualSpace: {
                    if (!expandTabs && atTab) continue;
                    value = values.space;

                    break;
                }

                default: {
                    assert(typeof chunk === "number", "expected number");
                    // Currently only replacement character.
                    value = String.fromCharCode(chunk);
                }
            }

        atTab = chunk === codes.horizontalTab;
        result.push(value);
    }

    return result.join("");
}
