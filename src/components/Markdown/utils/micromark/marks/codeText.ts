import { ok as assert } from "devlop";
import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    Event,
    State,
    Token,
    TokenizeContext,
} from "micromark-util-types";

export const codeText: Construct = {
    name: "codeText",
    previous,
    resolve: resolveCodeText,
    tokenize: tokenizeCodeText,
};

function resolveCodeText(events: Event[]) {
    let tailExitIndex = events.length - 4;
    let headEnterIndex = 3;
    let index: number;
    let enter: number | undefined;

    // If we start and end with an EOL or a space.
    if (
        (events[headEnterIndex][1].type === types.lineEnding ||
            events[headEnterIndex][1].type === "space") &&
        (events[tailExitIndex][1].type === types.lineEnding ||
            events[tailExitIndex][1].type === "space")
    ) {
        index = headEnterIndex;

        // And we have data.
        while (++index < tailExitIndex) {
            if (events[index][1].type === types.codeTextData) {
                // Then we have padding.
                events[headEnterIndex][1].type = types.codeTextPadding;
                events[tailExitIndex][1].type = types.codeTextPadding;
                headEnterIndex += 2;
                tailExitIndex -= 2;
                break;
            }
        }
    }

    // Merge adjacent spaces and data.
    index = headEnterIndex - 1;
    tailExitIndex++;

    while (++index <= tailExitIndex) {
        if (enter === undefined) {
            if (
                index !== tailExitIndex &&
                events[index][1].type !== types.lineEnding
            ) {
                enter = index;
            }
        } else if (
            index === tailExitIndex ||
            events[index][1].type === types.lineEnding
        ) {
            events[enter][1].type = types.codeTextData;

            if (index !== enter + 2) {
                events[enter][1].end = events[index - 1][1].end;
                events.splice(enter + 2, index - enter - 2);
                tailExitIndex -= index - enter - 2;
                index = enter + 2;
            }

            enter = undefined;
        }
    }

    return events;
}

function previous(this: TokenizeContext, code: Code) {
    // If there is a previous code, there will always be a tail.
    return (
        code !== codes.graveAccent ||
        this.events[this.events.length - 1][1].type === types.characterEscape
    );
}

function tokenizeCodeText(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    let sizeOpen = 0;
    let size: number;
    let token: Token;

    return start;

    /**
     * Start of code (text).
     *
     * ```markdown
     * > | `a`
     *     ^
     * > | \`a`
     *      ^
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.graveAccent, "expected `` ` ``");
        assert(previous.call(self, self.previous), "expected correct previous");
        effects.enter(types.codeText);
        effects.enter(types.codeTextSequence);
        return sequenceOpen(code);
    }

    /**
     * In opening sequence.
     *
     * ```markdown
     * > | `a`
     *     ^
     * ```
     *
     */
    function sequenceOpen(code: Code) {
        if (code === codes.graveAccent) {
            effects.consume(code);
            sizeOpen++;
            return sequenceOpen;
        }

        effects.exit(types.codeTextSequence);
        return between(code);
    }

    /**
     * Between something and something else.
     *
     * ```markdown
     * > | `a`
     *      ^^
     * ```
     *
     */
    function between(code: Code): State | undefined {
        // EOF.
        if (code === codes.eof) {
            return nok(code);
        }

        // To do: next major: don’t do spaces in resolve, but when compiling,
        // like `markdown-rs`.
        // Tabs don’t work, and virtual spaces don’t make sense.
        if (code === codes.space) {
            effects.enter("space");
            effects.consume(code);
            effects.exit("space");
            return between;
        }

        // Closing fence? Could also be data.
        if (code === codes.graveAccent) {
            token = effects.enter(types.codeTextSequence);
            size = 0;
            return sequenceClose(code);
        }

        if (markdownLineEnding(code)) {
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            return between;
        }

        // Data.
        effects.enter(types.codeTextData);
        return data(code);
    }

    /**
     * In data.
     *
     * ```markdown
     * > | `a`
     *      ^
     * ```
     *
     */
    function data(code: Code) {
        if (
            code === codes.eof ||
            code === codes.space ||
            code === codes.graveAccent ||
            markdownLineEnding(code)
        ) {
            effects.exit(types.codeTextData);
            return between(code);
        }

        effects.consume(code);
        return data;
    }

    /**
     * In closing sequence.
     *
     * ```markdown
     * > | `a`
     *       ^
     * ```
     *
     */
    function sequenceClose(code: Code): State | undefined {
        // More.
        if (code === codes.graveAccent) {
            effects.consume(code);
            size++;
            return sequenceClose;
        }

        // Done!
        if (size === sizeOpen) {
            effects.exit(types.codeTextSequence);
            effects.exit(types.codeText);
            return ok(code);
        }

        // More or less accents: mark as data.
        token.type = types.codeTextData;
        return data(code);
    }
}
