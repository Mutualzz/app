import { ok as assert } from "devlop";
import {
    asciiAlpha,
    asciiAlphanumeric,
    markdownLineEnding,
    markdownLineEndingOrSpace,
    markdownSpace,
} from "micromark-util-character";
import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";
import { codes, constants, types } from "micromark-util-symbol";
import { blankLine } from "./blankLine";

import type {
    Code,
    Construct,
    Effects,
    Event,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const htmlFlow: Construct = {
    concrete: true,
    name: "htmlFlow",
    resolveTo: resolveToHtmlFlow,
    tokenize: tokenizeHtmlFlow,
};

const blankLineBefore: Construct = {
    partial: true,
    tokenize: tokenizeBlankLineBefore,
};
const nonLazyContinuationStart = {
    partial: true,
    tokenize: tokenizeNonLazyContinuationStart,
};

function resolveToHtmlFlow(events: Event[]) {
    let index = events.length;

    while (index--) {
        if (
            events[index][0] === "enter" &&
            events[index][1].type === types.htmlFlow
        ) {
            break;
        }
    }

    if (index > 1 && events[index - 2][1].type === types.linePrefix) {
        // Add the prefix start to the HTML token.
        events[index][1].start = events[index - 2][1].start;
        // Add the prefix start to the HTML line token.
        events[index + 1][1].start = events[index - 2][1].start;
        // Remove the line prefix.
        events.splice(index - 2, 2);
    }

    return events;
}

function tokenizeHtmlFlow(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    let marker: number;
    let closingTag: boolean;
    let buffer: string;
    let index: number;
    let markerB: Code;

    return start;

    /**
     * Start of HTML (flow).
     *
     * ```markdown
     * > | <x />
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        // To do: parse indent like `markdown-rs`.
        return before(code);
    }

    /**
     * At `<`, after optional whitespace.
     *
     * ```markdown
     * > | <x />
     *     ^
     * ```
     *
     */
    function before(code: Code) {
        assert(code === codes.lessThan, "expected `<`");
        effects.enter(types.htmlFlow);
        effects.enter(types.htmlFlowData);
        effects.consume(code);
        return open;
    }

    /**
     * After `<`, at tag name or other stuff.
     *
     * ```markdown
     * > | <x />
     *      ^
     * > | <!doctype>
     *      ^
     * > | <!--xxx-->
     *      ^
     * ```
     *
     */
    function open(code: Code) {
        if (code === codes.exclamationMark) {
            effects.consume(code);
            return declarationOpen;
        }

        if (code === codes.slash) {
            effects.consume(code);
            closingTag = true;
            return tagCloseStart;
        }

        if (code === codes.questionMark) {
            effects.consume(code);
            marker = constants.htmlInstruction;
            // To do:
            // tokenizer.concrete = true
            // To do: use `markdown-rs` style interrupt.
            // While we’re in an instruction instead of a declaration, we’re on a `?`
            // right now, so we do need to search for `>`, similar to declarations.
            return self.interrupt ? ok : continuationDeclarationInside;
        }

        // ASCII alphabetical.
        if (asciiAlpha(code)) {
            assert(code !== null); // Always the case.
            effects.consume(code);
            buffer = String.fromCharCode(code);
            return tagName;
        }

        return nok(code);
    }

    /**
     * After `<!`, at declaration, comment, or CDATA.
     *
     * ```markdown
     * > | <!doctype>
     *       ^
     * > | <!--xxx-->
     *       ^
     * > | <![CDATA[>&<]]>
     *       ^
     * ```
     *
     */
    function declarationOpen(code: Code) {
        if (code === codes.dash) {
            effects.consume(code);
            marker = constants.htmlComment;
            return commentOpenInside;
        }

        if (code === codes.leftSquareBracket) {
            effects.consume(code);
            marker = constants.htmlCdata;
            index = 0;
            return cdataOpenInside;
        }

        // ASCII alphabetical.
        if (asciiAlpha(code)) {
            effects.consume(code);
            marker = constants.htmlDeclaration;
            // // Do not form containers.
            // tokenizer.concrete = true
            return self.interrupt ? ok : continuationDeclarationInside;
        }

        return nok(code);
    }

    /**
     * After `<!-`, inside a comment, at another `-`.
     *
     * ```markdown
     * > | <!--xxx-->
     *        ^
     * ```
     *
     */
    function commentOpenInside(code: Code) {
        if (code === codes.dash) {
            effects.consume(code);
            // // Do not form containers.
            // tokenizer.concrete = true
            return self.interrupt ? ok : continuationDeclarationInside;
        }

        return nok(code);
    }

    /**
     * After `<![`, inside CDATA, expecting `CDATA[`.
     *
     * ```markdown
     * > | <![CDATA[>&<]]>
     *        ^^^^^^
     * ```
     *
     */
    function cdataOpenInside(code: Code) {
        const value = constants.cdataOpeningString;

        if (code === value.charCodeAt(index++)) {
            effects.consume(code);

            if (index === value.length) {
                // // Do not form containers.
                // tokenizer.concrete = true
                return self.interrupt ? ok : continuation;
            }

            return cdataOpenInside;
        }

        return nok(code);
    }

    /**
     * After `</`, in closing tag, at tag name.
     *
     * ```markdown
     * > | </x>
     *       ^
     * ```
     *
     */
    function tagCloseStart(code: Code) {
        if (asciiAlpha(code)) {
            assert(code !== null); // Always the case.
            effects.consume(code);
            buffer = String.fromCharCode(code);
            return tagName;
        }

        return nok(code);
    }

    /**
     * In tag name.
     *
     * ```markdown
     * > | <ab>
     *      ^^
     * > | </ab>
     *       ^^
     * ```
     *
     */
    function tagName(code: Code) {
        if (
            code === codes.eof ||
            code === codes.slash ||
            code === codes.greaterThan ||
            markdownLineEndingOrSpace(code)
        ) {
            const slash = code === codes.slash;
            const name = buffer.toLowerCase();

            if (!slash && !closingTag && htmlRawNames.includes(name)) {
                marker = constants.htmlRaw;
                // // Do not form containers.
                // tokenizer.concrete = true
                return self.interrupt ? ok(code) : continuation(code);
            }

            if (htmlBlockNames.includes(buffer.toLowerCase())) {
                marker = constants.htmlBasic;

                if (slash) {
                    effects.consume(code);
                    return basicSelfClosing;
                }

                // // Do not form containers.
                // tokenizer.concrete = true
                return self.interrupt ? ok(code) : continuation(code);
            }

            marker = constants.htmlComplete;
            // Do not support complete HTML when interrupting.
            return self.interrupt && !self.parser.lazy[self.now().line]
                ? nok(code)
                : closingTag
                  ? completeClosingTagAfter(code)
                  : completeAttributeNameBefore(code);
        }

        // ASCII alphanumerical and `-`.
        if (code === codes.dash || asciiAlphanumeric(code)) {
            effects.consume(code);
            buffer += String.fromCharCode(code);
            return tagName;
        }

        return nok(code);
    }

    /**
     * After closing slash of a basic tag name.
     *
     * ```markdown
     * > | <div/>
     *          ^
     * ```
     *
     */
    function basicSelfClosing(code: Code) {
        if (code === codes.greaterThan) {
            effects.consume(code);
            // // Do not form containers.
            // tokenizer.concrete = true
            return self.interrupt ? ok : continuation;
        }

        return nok(code);
    }

    /**
     * After closing slash of a complete tag name.
     *
     * ```markdown
     * > | <x/>
     *        ^
     * ```
     *
     */
    function completeClosingTagAfter(code: Code) {
        if (markdownSpace(code)) {
            effects.consume(code);
            return completeClosingTagAfter;
        }

        return completeEnd(code);
    }

    /**
     * At an attribute name.
     *
     * At first, this state is used after a complete tag name, after whitespace,
     * where it expects optional attributes or the end of the tag.
     * It is also reused after attributes, when expecting more optional
     * attributes.
     *
     * ```markdown
     * > | <a />
     *        ^
     * > | <a :b>
     *        ^
     * > | <a _b>
     *        ^
     * > | <a b>
     *        ^
     * > | <a >
     *        ^
     * ```
     *
     */
    function completeAttributeNameBefore(code: Code): State | undefined {
        if (code === codes.slash) {
            effects.consume(code);
            return completeEnd;
        }

        // ASCII alphanumerical and `:` and `_`.
        if (
            code === codes.colon ||
            code === codes.underscore ||
            asciiAlpha(code)
        ) {
            effects.consume(code);
            return completeAttributeName;
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return completeAttributeNameBefore;
        }

        return completeEnd(code);
    }

    /**
     * In attribute name.
     *
     * ```markdown
     * > | <a :b>
     *         ^
     * > | <a _b>
     *         ^
     * > | <a b>
     *         ^
     * ```
     *
     */
    function completeAttributeName(code: Code) {
        // ASCII alphanumerical and `-`, `.`, `:`, and `_`.
        if (
            code === codes.dash ||
            code === codes.dot ||
            code === codes.colon ||
            code === codes.underscore ||
            asciiAlphanumeric(code)
        ) {
            effects.consume(code);
            return completeAttributeName;
        }

        return completeAttributeNameAfter(code);
    }

    /**
     * After attribute name, at an optional initializer, the end of the tag, or
     * whitespace.
     *
     * ```markdown
     * > | <a b>
     *         ^
     * > | <a b=c>
     *         ^
     * ```
     *
     */
    function completeAttributeNameAfter(code: Code): State | undefined {
        if (code === codes.equalsTo) {
            effects.consume(code);
            return completeAttributeValueBefore;
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return completeAttributeNameAfter;
        }

        return completeAttributeNameBefore(code);
    }

    /**
     * Before unquoted, double quoted, or single quoted attribute value, allowing
     * whitespace.
     *
     * ```markdown
     * > | <a b=c>
     *          ^
     * > | <a b="c">
     *          ^
     * ```
     *
     */
    function completeAttributeValueBefore(code: Code) {
        if (
            code === codes.eof ||
            code === codes.lessThan ||
            code === codes.equalsTo ||
            code === codes.greaterThan ||
            code === codes.graveAccent
        ) {
            return nok(code);
        }

        if (code === codes.quotationMark || code === codes.apostrophe) {
            effects.consume(code);
            markerB = code;
            return completeAttributeValueQuoted;
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return completeAttributeValueBefore;
        }

        return completeAttributeValueUnquoted(code);
    }

    /**
     * In double or single quoted attribute value.
     *
     * ```markdown
     * > | <a b="c">
     *           ^
     * > | <a b='c'>
     *           ^
     * ```
     *
     */
    function completeAttributeValueQuoted(code: Code) {
        if (code === markerB) {
            effects.consume(code);
            markerB = null;
            return completeAttributeValueQuotedAfter;
        }

        if (code === codes.eof || markdownLineEnding(code)) {
            return nok(code);
        }

        effects.consume(code);
        return completeAttributeValueQuoted;
    }

    /**
     * In unquoted attribute value.
     *
     * ```markdown
     * > | <a b=c>
     *          ^
     * ```
     *
     */
    function completeAttributeValueUnquoted(code: Code) {
        if (
            code === codes.eof ||
            code === codes.quotationMark ||
            code === codes.apostrophe ||
            code === codes.slash ||
            code === codes.lessThan ||
            code === codes.equalsTo ||
            code === codes.greaterThan ||
            code === codes.graveAccent ||
            markdownLineEndingOrSpace(code)
        ) {
            return completeAttributeNameAfter(code);
        }

        effects.consume(code);
        return completeAttributeValueUnquoted;
    }

    /**
     * After double or single quoted attribute value, before whitespace or the
     * end of the tag.
     *
     * ```markdown
     * > | <a b="c">
     *            ^
     * ```
     *
     */
    function completeAttributeValueQuotedAfter(code: Code) {
        if (
            code === codes.slash ||
            code === codes.greaterThan ||
            markdownSpace(code)
        ) {
            return completeAttributeNameBefore(code);
        }

        return nok(code);
    }

    /**
     * In certain circumstances of a complete tag where only an `>` is allowed.
     *
     * ```markdown
     * > | <a b="c">
     *             ^
     * ```
     *
     */
    function completeEnd(code: Code) {
        if (code === codes.greaterThan) {
            effects.consume(code);
            return completeAfter;
        }

        return nok(code);
    }

    /**
     * After `>` in a complete tag.
     *
     * ```markdown
     * > | <x>
     *        ^
     * ```
     *
     */
    function completeAfter(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            // // Do not form containers.
            // tokenizer.concrete = true
            return continuation(code);
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return completeAfter;
        }

        return nok(code);
    }

    /**
     * In continuation of any HTML kind.
     *
     * ```markdown
     * > | <!--xxx-->
     *          ^
     * ```
     *
     */
    function continuation(code: Code) {
        if (code === codes.dash && marker === constants.htmlComment) {
            effects.consume(code);
            return continuationCommentInside;
        }

        if (code === codes.lessThan && marker === constants.htmlRaw) {
            effects.consume(code);
            return continuationRawTagOpen;
        }

        if (
            code === codes.greaterThan &&
            marker === constants.htmlDeclaration
        ) {
            effects.consume(code);
            return continuationClose;
        }

        if (
            code === codes.questionMark &&
            marker === constants.htmlInstruction
        ) {
            effects.consume(code);
            return continuationDeclarationInside;
        }

        if (
            code === codes.rightSquareBracket &&
            marker === constants.htmlCdata
        ) {
            effects.consume(code);
            return continuationCdataInside;
        }

        if (
            markdownLineEnding(code) &&
            (marker === constants.htmlBasic ||
                marker === constants.htmlComplete)
        ) {
            effects.exit(types.htmlFlowData);
            return effects.check(
                blankLineBefore,
                continuationAfter,
                continuationStart,
            )(code);
        }

        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.htmlFlowData);
            return continuationStart(code);
        }

        effects.consume(code);
        return continuation;
    }

    /**
     * In continuation, at eol.
     *
     * ```markdown
     * > | <x>
     *        ^
     *   | asd
     * ```
     *
     */
    function continuationStart(code: Code) {
        return effects.check(
            nonLazyContinuationStart,
            continuationStartNonLazy,
            continuationAfter,
        )(code);
    }

    /**
     * In continuation, at eol, before non-lazy content.
     *
     * ```markdown
     * > | <x>
     *        ^
     *   | asd
     * ```
     *
     */
    function continuationStartNonLazy(code: Code) {
        assert(markdownLineEnding(code));
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return continuationBefore;
    }

    /**
     * In continuation, before non-lazy content.
     *
     * ```markdown
     *   | <x>
     * > | asd
     *     ^
     * ```
     *
     */
    function continuationBefore(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            return continuationStart(code);
        }

        effects.enter(types.htmlFlowData);
        return continuation(code);
    }

    /**
     * In comment continuation, after one `-`, expecting another.
     *
     * ```markdown
     * > | <!--xxx-->
     *             ^
     * ```
     *
     */
    function continuationCommentInside(code: Code): State | undefined {
        if (code === codes.dash) {
            effects.consume(code);
            return continuationDeclarationInside;
        }

        return continuation(code);
    }

    /**
     * In raw continuation, after `<`, at `/`.
     *
     * ```markdown
     * > | <script>console.log(1)</script>
     *                            ^
     * ```
     *
     */
    function continuationRawTagOpen(code: Code): State | undefined {
        if (code === codes.slash) {
            effects.consume(code);
            buffer = "";
            return continuationRawEndTag;
        }

        return continuation(code);
    }

    /**
     * In raw continuation, after `</`, in a raw tag name.
     *
     * ```markdown
     * > | <script>console.log(1)</script>
     *                             ^^^^^^
     * ```
     *
     */
    function continuationRawEndTag(code: Code) {
        if (code === codes.greaterThan) {
            const name = buffer.toLowerCase();

            if (htmlRawNames.includes(name)) {
                effects.consume(code);
                return continuationClose;
            }

            return continuation(code);
        }

        if (asciiAlpha(code) && buffer.length < constants.htmlRawSizeMax) {
            assert(code !== null); // Always the case.
            effects.consume(code);
            buffer += String.fromCharCode(code);
            return continuationRawEndTag;
        }

        return continuation(code);
    }

    /**
     * In cdata continuation, after `]`, expecting `]>`.
     *
     * ```markdown
     * > | <![CDATA[>&<]]>
     *                  ^
     * ```
     *
     */
    function continuationCdataInside(code: Code): State | undefined {
        if (code === codes.rightSquareBracket) {
            effects.consume(code);
            return continuationDeclarationInside;
        }

        return continuation(code);
    }

    /**
     * In declaration or instruction continuation, at `>`.
     *
     * ```markdown
     * > | <!-->
     *         ^
     * > | <?>
     *       ^
     * > | <!q>
     *        ^
     * > | <!--ab-->
     *             ^
     * > | <![CDATA[>&<]]>
     *                   ^
     * ```
     *
     */
    function continuationDeclarationInside(code: Code): State | undefined {
        if (code === codes.greaterThan) {
            effects.consume(code);
            return continuationClose;
        }

        // More dashes.
        if (code === codes.dash && marker === constants.htmlComment) {
            effects.consume(code);
            return continuationDeclarationInside;
        }

        return continuation(code);
    }

    /**
     * In closed continuation: everything we get until the eol/eof is part of it.
     *
     * ```markdown
     * > | <!doctype>
     *               ^
     * ```
     *
     */
    function continuationClose(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.htmlFlowData);
            return continuationAfter(code);
        }

        effects.consume(code);
        return continuationClose;
    }

    /**
     * Done.
     *
     * ```markdown
     * > | <!doctype>
     *               ^
     * ```
     *
     */
    function continuationAfter(code: Code) {
        effects.exit(types.htmlFlow);
        // // Feel free to interrupt.
        // tokenizer.interrupt = false
        // // No longer concrete.
        // tokenizer.concrete = false
        return ok(code);
    }
}

function tokenizeNonLazyContinuationStart(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return start;

    /**
     * At eol, before continuation.
     *
     * ```markdown
     * > | * ```js
     *            ^
     *   | b
     * ```
     *
     */
    function start(code: Code) {
        if (markdownLineEnding(code)) {
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            return after;
        }

        return nok(code);
    }

    /**
     * A continuation.
     *
     * ```markdown
     *   | * ```js
     * > | b
     *     ^
     * ```
     *
     */
    function after(code: Code) {
        return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
    }
}

function tokenizeBlankLineBefore(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return start;

    /**
     * Before eol, expecting blank line.
     *
     * ```markdown
     * > | <div>
     *          ^
     *   |
     * ```
     *
     */
    function start(code: Code) {
        assert(markdownLineEnding(code), "expected a line ending");
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return effects.attempt(blankLine, ok, nok);
    }
}
