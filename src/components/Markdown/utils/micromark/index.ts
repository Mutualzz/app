import type {
    CompileContext,
    CompileData,
    Config,
    Extension,
    Handle,
    OnEnterError,
    OnExitError,
    Options,
} from "@app-types/micromark";
import { decodeNamedCharacterReference } from "decode-named-character-reference";
import { ok as assert } from "devlop";
import type {
    Blockquote,
    Break,
    Code,
    Definition,
    Emphasis,
    Heading,
    Html,
    Image,
    InlineCode,
    Link,
    List,
    ListItem,
    Nodes,
    Paragraph,
    PhrasingContent,
    ReferenceType,
    Root,
    Strong,
    Text,
    ThematicBreak,
} from "mdast";
import { toString } from "mdast-util-to-string";
import { decodeNumericCharacterReference } from "micromark-util-decode-numeric-character-reference";
import { decodeString } from "micromark-util-decode-string";
import { normalizeIdentifier } from "micromark-util-normalize-identifier";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Encoding,
    Event,
    Spoiler,
    Strikethrough,
    Token,
    Underline,
    Value,
} from "micromark-util-types";
import type { Point } from "unist";
import { stringifyPosition } from "unist-util-stringify-position";
import { parse } from "./parse";
import { postprocess } from "./postprocess";
import { preprocess } from "./preprocess";

const own = {}.hasOwnProperty;

/**
 * Turn markdown into a syntax tree.
 */
export function micromark(
    value: Value,
    encoding?: Encoding | null | undefined,
    options?: Options | null | undefined,
): Root {
    if (typeof encoding !== "string") {
        options = encoding;
        encoding = undefined;
    }

    return compiler(options)(
        postprocess(
            parse(options)
                .document()
                .write(preprocess()(value, encoding, true)),
        ),
    );
}

/**
 * Note this compiler only understand complete buffering, not streaming.
 */
function compiler(options: Options | null | undefined) {
    const config: Config = {
        transforms: [],
        canContainEols: [
            "emphasis",
            "fragment",
            "heading",
            "paragraph",
            "strong",
        ],
        enter: {
            autolink: opener(link),
            autolinkProtocol: onenterdata,
            autolinkEmail: onenterdata,
            atxHeading: opener(heading),
            blockQuote: opener(blockQuote),
            characterEscape: onenterdata,
            characterReference: onenterdata,
            codeFenced: opener(codeFlow),
            codeFencedFenceInfo: buffer,
            codeFencedFenceMeta: buffer,
            codeIndented: opener(codeFlow, buffer),
            codeText: opener(codeText, buffer),
            codeTextData: onenterdata,
            data: onenterdata,
            codeFlowValue: onenterdata,
            definition: opener(definition),
            definitionDestinationString: buffer,
            definitionLabelString: buffer,
            definitionTitleString: buffer,
            emphasis: opener(emphasis),
            hardBreakEscape: opener(hardBreak),
            hardBreakTrailing: opener(hardBreak),
            htmlFlow: opener(html, buffer),
            htmlFlowData: onenterdata,
            htmlText: opener(html, buffer),
            htmlTextData: onenterdata,
            image: opener(image),
            label: buffer,
            link: opener(link),
            listItem: opener(listItem),
            listItemValue: onenterlistitemvalue,
            listOrdered: opener(list, onenterlistordered),
            listUnordered: opener(list),
            paragraph: opener(paragraph),
            reference: onenterreference,
            referenceString: buffer,
            resourceDestinationString: buffer,
            resourceTitleString: buffer,
            setextHeading: opener(heading),
            spoiler: opener(spoiler as any),
            strong: opener(strong),
            strikethrough: opener(strikethrough as any),
            underline: opener(underline as any),
            thematicBreak: opener(thematicBreak),
        },
        exit: {
            atxHeading: closer(),
            atxHeadingSequence: onexitatxheadingsequence,
            autolink: closer(),
            autolinkEmail: onexitautolinkemail,
            autolinkProtocol: onexitautolinkprotocol,
            blockQuote: closer(),
            characterEscapeValue: onexitdata,
            characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
            characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
            characterReferenceValue: onexitcharacterreferencevalue,
            characterReference: onexitcharacterreference,
            codeFenced: closer(onexitcodefenced),
            codeFencedFence: onexitcodefencedfence,
            codeFencedFenceInfo: onexitcodefencedfenceinfo,
            codeFencedFenceMeta: onexitcodefencedfencemeta,
            codeFlowValue: onexitdata,
            codeIndented: closer(onexitcodeindented),
            codeText: closer(onexitcodetext),
            codeTextData: onexitdata,
            data: onexitdata,
            definition: closer(),
            definitionDestinationString: onexitdefinitiondestinationstring,
            definitionLabelString: onexitdefinitionlabelstring,
            definitionTitleString: onexitdefinitiontitlestring,
            emphasis: closer(),
            hardBreakEscape: closer(onexithardbreak),
            hardBreakTrailing: closer(onexithardbreak),
            htmlFlow: closer(onexithtmlflow),
            htmlFlowData: onexitdata,
            htmlText: closer(onexithtmltext),
            htmlTextData: onexitdata,
            image: closer(onexitimage),
            label: onexitlabel,
            labelText: onexitlabeltext,
            lineEnding: onexitlineending,
            link: closer(onexitlink),
            listItem: closer(),
            listOrdered: closer(),
            listUnordered: closer(),
            paragraph: closer(),
            referenceString: onexitreferencestring,
            resourceDestinationString: onexitresourcedestinationstring,
            resourceTitleString: onexitresourcetitlestring,
            resource: onexitresource,
            setextHeading: closer(onexitsetextheading),
            setextHeadingLineSequence: onexitsetextheadinglinesequence,
            setextHeadingText: onexitsetextheadingtext,
            spoiler: closer(),
            strong: closer(),
            strikethrough: closer(),
            underline: closer(),
            thematicBreak: closer(),
        },
    };

    configure(config, (options || {}).mdastExtensions || []);

    const data: CompileData = {};

    return compile;

    /**
     * Turn micromark events into an mdast tree.
     */
    function compile(events: Event[]): Root {
        let tree: Root = { type: "root", children: [] };
        const context: Omit<CompileContext, "sliceSerialize"> = {
            stack: [tree],
            tokenStack: [],
            config,
            enter,
            exit,
            buffer,
            resume,
            data,
        };
        const listStack: number[] = [];
        let index = -1;

        while (++index < events.length) {
            // We preprocess lists to add `listItem` tokens, and to infer whether
            // items the list itself are spread out.
            if (
                events[index][1].type === types.listOrdered ||
                events[index][1].type === types.listUnordered
            ) {
                if (events[index][0] === "enter") {
                    listStack.push(index);
                } else {
                    const tail = listStack.pop();
                    assert(
                        typeof tail === "number",
                        "expected list to be open",
                    );
                    index = prepareList(events, tail, index);
                }
            }
        }

        index = -1;

        while (++index < events.length) {
            const handler = config[events[index][0]];

            if (own.call(handler, events[index][1].type)) {
                handler[events[index][1].type].call(
                    Object.assign(
                        { sliceSerialize: events[index][2].sliceSerialize },
                        context,
                    ),
                    events[index][1],
                );
            }
        }

        // Handle tokens still being open.
        if (context.tokenStack.length > 0) {
            const tail = context.tokenStack[context.tokenStack.length - 1];
            const handler = tail[1] || defaultOnError;
            handler.call(context, undefined, tail[0]);
        }

        // Figure out `root` position.
        tree.position = {
            start: point(
                events.length > 0
                    ? events[0][1].start
                    : { line: 1, column: 1, offset: 0 },
            ),
            end: point(
                events.length > 0
                    ? events[events.length - 2][1].end
                    : { line: 1, column: 1, offset: 0 },
            ),
        };

        // Call transforms.
        index = -1;
        while (++index < config.transforms.length) {
            tree = config.transforms[index](tree) || tree;
        }

        return tree;
    }

    function prepareList(
        events: Event[],
        start: number,
        length: number,
    ): number {
        let index = start - 1;
        let containerBalance = -1;
        let listSpread = false;
        let listItem: Token | undefined;
        let lineIndex: number | undefined;
        let firstBlankLineIndex: number | undefined;
        let atMarker: boolean | undefined;

        while (++index <= length) {
            const event = events[index];

            switch (event[1].type) {
                case types.listUnordered:
                case types.listOrdered:
                case types.blockQuote: {
                    if (event[0] === "enter") {
                        containerBalance++;
                    } else {
                        containerBalance--;
                    }

                    atMarker = undefined;

                    break;
                }

                case types.lineEndingBlank: {
                    if (event[0] === "enter") {
                        if (
                            listItem &&
                            !atMarker &&
                            !containerBalance &&
                            !firstBlankLineIndex
                        ) {
                            firstBlankLineIndex = index;
                        }

                        atMarker = undefined;
                    }

                    break;
                }

                case types.linePrefix:
                case types.listItemValue:
                case types.listItemMarker:
                case types.listItemPrefix:
                case types.listItemPrefixWhitespace: {
                    // Empty.

                    break;
                }

                default: {
                    atMarker = undefined;
                }
            }

            if (
                (!containerBalance &&
                    event[0] === "enter" &&
                    event[1].type === types.listItemPrefix) ||
                (containerBalance === -1 &&
                    event[0] === "exit" &&
                    (event[1].type === types.listUnordered ||
                        event[1].type === types.listOrdered))
            ) {
                if (listItem) {
                    let tailIndex = index;
                    lineIndex = undefined;

                    while (tailIndex--) {
                        const tailEvent = events[tailIndex];

                        if (
                            tailEvent[1].type === types.lineEnding ||
                            tailEvent[1].type === types.lineEndingBlank
                        ) {
                            if (tailEvent[0] === "exit") continue;

                            if (lineIndex) {
                                events[lineIndex][1].type =
                                    types.lineEndingBlank;
                                listSpread = true;
                            }

                            tailEvent[1].type = types.lineEnding;
                            lineIndex = tailIndex;
                        } else if (
                            tailEvent[1].type === types.linePrefix ||
                            tailEvent[1].type === types.blockQuotePrefix ||
                            tailEvent[1].type ===
                                types.blockQuotePrefixWhitespace ||
                            tailEvent[1].type === types.blockQuoteMarker ||
                            tailEvent[1].type === types.listItemIndent
                        ) {
                            // Empty
                        } else {
                            break;
                        }
                    }

                    if (
                        firstBlankLineIndex &&
                        (!lineIndex || firstBlankLineIndex < lineIndex)
                    ) {
                        listItem._spread = true;
                    }

                    // Fix position.
                    listItem.end = Object.assign(
                        {},
                        lineIndex ? events[lineIndex][1].start : event[1].end,
                    );

                    events.splice(lineIndex || index, 0, [
                        "exit",
                        listItem,
                        event[2],
                    ]);
                    index++;
                    length++;
                }

                // Create a new list item.
                if (event[1].type === types.listItemPrefix) {
                    const item: Token = {
                        type: "listItem",
                        _spread: false,
                        start: Object.assign({}, event[1].start),
                        // @ts-expect-error: we’ll add `end` in a second.
                        end: undefined,
                    };
                    listItem = item;
                    events.splice(index, 0, ["enter", item, event[2]]);
                    index++;
                    length++;
                    firstBlankLineIndex = undefined;
                    atMarker = true;
                }
            }
        }

        events[start][1]._spread = listSpread;
        return length;
    }

    /**
     * Create an opener handle.
     */
    function opener(
        create: (token: Token) => Nodes,
        and?: Handle | undefined,
    ): Handle {
        return open;

        function open(this: CompileContext, token: Token): undefined {
            enter.call(this, create(token), token);
            if (and) and.call(this, token);
        }
    }

    function buffer(this: CompileContext): undefined {
        this.stack.push({ type: "fragment", children: [] });
    }

    function enter(
        this: CompileContext,
        node: Nodes,
        token: Token,
        errorHandler?: OnEnterError | null,
    ): undefined {
        const parent = this.stack[this.stack.length - 1];
        assert(parent, "expected `parent`");
        assert("children" in parent, "expected `parent`");
        const siblings: Nodes[] = parent.children;
        siblings.push(node);
        this.stack.push(node);
        this.tokenStack.push([token, errorHandler || undefined]);
        node.position = {
            start: point(token.start),
            // @ts-expect-error: `end` will be patched later.
            end: undefined,
        };
    }

    /**
     * Create a closer handle.
     */
    function closer(and?: Handle | undefined): Handle {
        return close;

        function close(this: CompileContext, token: Token): undefined {
            if (and) and.call(this, token);
            exit.call(this, token);
        }
    }

    function exit(
        this: CompileContext,
        token: Token,
        onExitError?: OnExitError | null,
    ): undefined {
        const node = this.stack.pop();
        assert(node, "expected `node`");
        const open = this.tokenStack.pop();

        if (!open) {
            throw new Error(
                "Cannot close `" +
                    token.type +
                    "` (" +
                    stringifyPosition({ start: token.start, end: token.end }) +
                    "): it’s not open",
            );
        } else if (open[0].type !== token.type) {
            if (onExitError) {
                onExitError.call(this, token, open[0]);
            } else {
                const handler = open[1] || defaultOnError;
                handler.call(this, token, open[0]);
            }
        }

        assert(node.type !== "fragment", "unexpected fragment `exit`ed");
        assert(node.position, "expected `position` to be defined");
        node.position.end = point(token.end);
    }

    function resume(this: CompileContext): string {
        return toString(this.stack.pop());
    }

    //
    // Handlers.
    //

    function onenterlistordered(this: CompileContext): undefined {
        this.data.expectingFirstListItemValue = true;
    }

    function onenterlistitemvalue(
        this: CompileContext,
        token: Token,
    ): undefined {
        if (this.data.expectingFirstListItemValue) {
            const ancestor = this.stack[this.stack.length - 2];
            assert(ancestor, "expected nodes on stack");
            assert(ancestor.type === "list", "expected list on stack");
            ancestor.start = Number.parseInt(
                this.sliceSerialize(token),
                constants.numericBaseDecimal,
            );
            this.data.expectingFirstListItemValue = undefined;
        }
    }

    function onexitcodefencedfenceinfo(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "code", "expected code on stack");
        node.lang = data;
    }

    function onexitcodefencedfencemeta(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "code", "expected code on stack");
        node.meta = data;
    }

    function onexitcodefencedfence(this: CompileContext): undefined {
        // Exit if this is the closing fence.
        if (this.data.flowCodeInside) return;
        this.buffer();
        this.data.flowCodeInside = true;
    }

    function onexitcodefenced(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "code", "expected code on stack");

        node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
        this.data.flowCodeInside = undefined;
    }

    function onexitcodeindented(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "code", "expected code on stack");

        node.value = data.replace(/(\r?\n|\r)$/g, "");
    }

    function onexitdefinitionlabelstring(
        this: CompileContext,
        token: Token,
    ): undefined {
        const label = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "definition", "expected definition on stack");

        node.label = label;
        node.identifier = normalizeIdentifier(
            this.sliceSerialize(token),
        ).toLowerCase();
    }

    function onexitdefinitiontitlestring(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "definition", "expected definition on stack");

        node.title = data;
    }

    function onexitdefinitiondestinationstring(
        this: CompileContext,
    ): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "definition", "expected definition on stack");

        node.url = data;
    }

    function onexitatxheadingsequence(
        this: CompileContext,
        token: Token,
    ): undefined {
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "heading", "expected heading on stack");

        if (!node.depth) {
            const depth = this.sliceSerialize(token).length;

            assert(
                depth === 1 ||
                    depth === 2 ||
                    depth === 3 ||
                    depth === 4 ||
                    depth === 5 ||
                    depth === 6,
                "expected `depth` between `1` and `6`",
            );

            node.depth = depth;
        }
    }

    function onexitsetextheadingtext(this: CompileContext): undefined {
        this.data.setextHeadingSlurpLineEnding = true;
    }

    function onexitsetextheadinglinesequence(
        this: CompileContext,
        token: Token,
    ): undefined {
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "heading", "expected heading on stack");

        node.depth =
            this.sliceSerialize(token).codePointAt(0) === codes.equalsTo
                ? 1
                : 2;
    }

    function onexitsetextheading(this: CompileContext): undefined {
        this.data.setextHeadingSlurpLineEnding = undefined;
    }

    function onenterdata(this: CompileContext, token: Token): undefined {
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert("children" in node, "expected parent on stack");

        const siblings: Nodes[] = node.children;

        let tail = siblings[siblings.length - 1];

        if (!tail || tail.type !== "text") {
            // Add a new text node.
            tail = text();
            tail.position = {
                start: point(token.start),
                // @ts-expect-error: we’ll add `end` later.
                end: undefined,
            };
            siblings.push(tail);
        }

        this.stack.push(tail);
    }

    function onexitdata(this: CompileContext, token: Token): undefined {
        const tail = this.stack.pop();
        assert(tail, "expected a `node` to be on the stack");
        assert("value" in tail, "expected a `literal` to be on the stack");
        assert(tail.position, "expected `node` to have an open position");
        tail.value += this.sliceSerialize(token);
        tail.position.end = point(token.end);
    }

    function onexitlineending(this: CompileContext, token: Token): undefined {
        const context = this.stack[this.stack.length - 1];
        assert(context, "expected `node`");

        // If we’re at a hard break, include the line ending in there.
        if (this.data.atHardBreak) {
            assert("children" in context, "expected `parent`");
            const tail = context.children[context.children.length - 1];
            assert(tail.position, "expected tail to have a starting position");
            tail.position.end = point(token.end);
            this.data.atHardBreak = undefined;
            return;
        }

        if (
            !this.data.setextHeadingSlurpLineEnding &&
            config.canContainEols.includes(context.type)
        ) {
            onenterdata.call(this, token);
            onexitdata.call(this, token);
        }
    }

    function onexithardbreak(this: CompileContext): undefined {
        this.data.atHardBreak = true;
    }

    function onexithtmlflow(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "html", "expected html on stack");

        node.value = data;
    }

    function onexithtmltext(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "html", "expected html on stack");

        node.value = data;
    }

    function onexitcodetext(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "inlineCode", "expected inline code on stack");

        node.value = data;
    }

    function onexitlink(this: CompileContext): undefined {
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "link", "expected link on stack");

        // Note: there are also `identifier` and `label` fields on this link node!
        // These are used / cleaned here.

        // To do: clean.
        if (this.data.inReference) {
            const referenceType: ReferenceType =
                this.data.referenceType || "shortcut";

            node.type += "Reference";
            // @ts-expect-error: mutate.
            node.referenceType = referenceType;
            // @ts-expect-error: mutate.
            delete node.url;
            delete node.title;
        } else {
            // @ts-expect-error: mutate.
            delete node.identifier;
            // @ts-expect-error: mutate.
            delete node.label;
        }

        this.data.referenceType = undefined;
    }

    function onexitimage(this: CompileContext): undefined {
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "image", "expected image on stack");

        // Note: there are also `identifier` and `label` fields on this link node!
        // These are used / cleaned here.

        // To do: clean.
        if (this.data.inReference) {
            const referenceType: ReferenceType =
                this.data.referenceType || "shortcut";

            node.type += "Reference";
            // @ts-expect-error: mutate.
            node.referenceType = referenceType;
            // @ts-expect-error: mutate.
            delete node.url;
            delete node.title;
        } else {
            // @ts-expect-error: mutate.
            delete node.identifier;
            // @ts-expect-error: mutate.
            delete node.label;
        }

        this.data.referenceType = undefined;
    }

    function onexitlabeltext(this: CompileContext, token: Token) {
        const string = this.sliceSerialize(token);
        const ancestor = this.stack[this.stack.length - 2];
        assert(ancestor, "expected ancestor on stack");
        assert(
            ancestor.type === "image" || ancestor.type === "link",
            "expected image or link on stack",
        );

        // @ts-expect-error: stash this on the node, as it might become a reference
        // later.
        ancestor.label = decodeString(string);
        // @ts-expect-error: same as above.
        ancestor.identifier = normalizeIdentifier(string).toLowerCase();
    }

    function onexitlabel(this: CompileContext): undefined {
        const fragment = this.stack[this.stack.length - 1];
        assert(fragment, "expected node on stack");
        assert(fragment.type === "fragment", "expected fragment on stack");
        const value = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(
            node.type === "image" || node.type === "link",
            "expected image or link on stack",
        );

        // Assume a reference.
        this.data.inReference = true;

        if (node.type === "link") {
            const children: PhrasingContent[] = fragment.children;

            node.children = children;
        } else {
            node.alt = value;
        }
    }

    function onexitresourcedestinationstring(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(
            node.type === "image" || node.type === "link",
            "expected image or link on stack",
        );
        node.url = data;
    }

    function onexitresourcetitlestring(this: CompileContext): undefined {
        const data = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(
            node.type === "image" || node.type === "link",
            "expected image or link on stack",
        );
        node.title = data;
    }

    function onexitresource(this: CompileContext): undefined {
        this.data.inReference = undefined;
    }

    function onenterreference(this: CompileContext) {
        this.data.referenceType = "collapsed";
    }

    function onexitreferencestring(this: CompileContext, token: Token) {
        const label = this.resume();
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(
            node.type === "image" || node.type === "link",
            "expected image reference or link reference on stack",
        );

        // @ts-expect-error: stash this on the node, as it might become a reference
        // later.
        node.label = label;
        // @ts-expect-error: same as above.
        node.identifier = normalizeIdentifier(
            this.sliceSerialize(token),
        ).toLowerCase();
        this.data.referenceType = "full";
    }

    function onexitcharacterreferencemarker(
        this: CompileContext,
        token: Token,
    ) {
        assert(
            token.type === "characterReferenceMarkerNumeric" ||
                token.type === "characterReferenceMarkerHexadecimal",
        );
        this.data.characterReferenceType = token.type;
    }

    function onexitcharacterreferencevalue(this: CompileContext, token: Token) {
        const data = this.sliceSerialize(token);
        const type = this.data.characterReferenceType;
        let value: string;

        if (type) {
            value = decodeNumericCharacterReference(
                data,
                type === types.characterReferenceMarkerNumeric
                    ? constants.numericBaseDecimal
                    : constants.numericBaseHexadecimal,
            );
            this.data.characterReferenceType = undefined;
        } else {
            const result = decodeNamedCharacterReference(data);
            assert(result !== false, "expected reference to decode");
            value = result;
        }

        const tail = this.stack[this.stack.length - 1];
        assert(tail, "expected `node`");
        assert("value" in tail, "expected `node.value`");
        tail.value += value;
    }

    function onexitcharacterreference(this: CompileContext, token: Token) {
        const tail = this.stack.pop();
        assert(tail, "expected `node`");
        assert(tail.position, "expected `node.position`");
        tail.position.end = point(token.end);
    }

    function onexitautolinkprotocol(this: CompileContext, token: Token) {
        onexitdata.call(this, token);
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "link", "expected link on stack");

        node.url = this.sliceSerialize(token);
    }

    function onexitautolinkemail(this: CompileContext, token: Token) {
        onexitdata.call(this, token);
        const node = this.stack[this.stack.length - 1];
        assert(node, "expected node on stack");
        assert(node.type === "link", "expected link on stack");

        node.url = "mailto:" + this.sliceSerialize(token);
    }

    //
    // Creaters.
    //

    function blockQuote(): Blockquote {
        return { type: "blockquote", children: [] };
    }

    function codeFlow(): Code {
        return { type: "code", lang: null, meta: null, value: "" };
    }

    function codeText(): InlineCode {
        return { type: "inlineCode", value: "" };
    }

    function definition(): Definition {
        return {
            type: "definition",
            identifier: "",
            label: null,
            title: null,
            url: "",
        };
    }

    function emphasis(): Emphasis {
        return { type: "emphasis", children: [] };
    }

    function heading(): Heading {
        return {
            type: "heading",
            // @ts-expect-error `depth` will be set later.
            depth: 0,
            children: [],
        };
    }

    function hardBreak(): Break {
        return { type: "break" };
    }

    function html(): Html {
        return { type: "html", value: "" };
    }

    function image(): Image {
        return { type: "image", title: null, url: "", alt: null };
    }

    function link(): Link {
        return { type: "link", title: null, url: "", children: [] };
    }

    function list(token: Token): List {
        return {
            type: "list",
            ordered: token.type === "listOrdered",
            start: null,
            spread: token._spread,
            children: [],
        };
    }
    function listItem(token: Token): ListItem {
        return {
            type: "listItem",
            spread: token._spread,
            checked: null,
            children: [],
        };
    }

    function paragraph(): Paragraph {
        return { type: "paragraph", children: [] };
    }

    function spoiler(): Spoiler {
        return {
            type: "spoiler",
            children: [],
            data: {
                hName: "spoiler",
            },
        };
    }

    function strong(): Strong {
        return { type: "strong", children: [] };
    }

    function strikethrough(): Strikethrough {
        return {
            type: "strikethrough",
            children: [],
            data: {
                hName: "del",
            },
        };
    }

    function underline(): Underline {
        return {
            type: "underline",
            children: [],
            data: { hName: "u" },
        };
    }

    function text(): Text {
        return { type: "text", value: "" };
    }

    function thematicBreak(): ThematicBreak {
        return { type: "thematicBreak" };
    }
}

/**
 * Copy a point-like value.
 */
function point(d: Point): Point {
    return { line: d.line, column: d.column, offset: d.offset };
}

function configure(
    combined: Config,
    extensions: (Extension[] | Extension)[],
): undefined {
    let index = -1;

    while (++index < extensions.length) {
        const value = extensions[index];

        if (Array.isArray(value)) {
            configure(combined, value);
        } else {
            extension(combined, value);
        }
    }
}

function extension(combined: Config, extension: Extension): undefined {
    let key: keyof Extension;

    for (key in extension) {
        if (own.call(extension, key)) {
            switch (key) {
                case "canContainEols": {
                    const right = extension[key];
                    if (right) {
                        combined[key].push(...right);
                    }

                    break;
                }

                case "transforms": {
                    const right = extension[key];
                    if (right) {
                        combined[key].push(...right);
                    }

                    break;
                }

                case "enter":
                case "exit": {
                    const right = extension[key];
                    if (right) {
                        Object.assign(combined[key], right);
                    }

                    break;
                }
                // No default
            }
        }
    }
}

function defaultOnError(
    this: Omit<CompileContext, "sliceSerialize">,
    left: Token | undefined,
    right: Token,
) {
    if (left) {
        throw new Error(
            "Cannot close `" +
                left.type +
                "` (" +
                stringifyPosition({ start: left.start, end: left.end }) +
                "): a different token (`" +
                right.type +
                "`, " +
                stringifyPosition({ start: right.start, end: right.end }) +
                ") is open",
        );
    } else {
        throw new Error(
            "Cannot close document, a token (`" +
                right.type +
                "`, " +
                stringifyPosition({ start: right.start, end: right.end }) +
                ") is still open",
        );
    }
}
