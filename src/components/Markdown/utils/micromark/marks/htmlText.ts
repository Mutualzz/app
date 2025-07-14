import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import {
    asciiAlpha,
    asciiAlphanumeric,
    markdownLineEnding,
    markdownLineEndingOrSpace,
    markdownSpace,
} from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const htmlText: Construct = {
    name: "htmlText",
    tokenize: tokenizeHtmlText,
};

function tokenizeHtmlText(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    let marker: NonNullable<Code> | undefined;
    let index: number;
    let returnState: State;

    return start;

    /**
     * Start of HTML (text).
     *
     * ```markdown
     * > | a <b> c
     *       ^
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.lessThan, "expected `<`");
        effects.enter(types.htmlText);
        effects.enter(types.htmlTextData);
        effects.consume(code);
        return open;
    }

    /**
     * After `<`, at tag name or other stuff.
     *
     * ```markdown
     * > | a <b> c
     *        ^
     * > | a <!doctype> c
     *        ^
     * > | a <!--b--> c
     *        ^
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
            return tagCloseStart;
        }

        if (code === codes.questionMark) {
            effects.consume(code);
            return instruction;
        }

        // ASCII alphabetical.
        if (asciiAlpha(code)) {
            effects.consume(code);
            return tagOpen;
        }

        return nok(code);
    }

    /**
     * After `<!`, at declaration, comment, or CDATA.
     *
     * ```markdown
     * > | a <!doctype> c
     *         ^
     * > | a <!--b--> c
     *         ^
     * > | a <![CDATA[>&<]]> c
     *         ^
     * ```
     *
     */
    function declarationOpen(code: Code) {
        if (code === codes.dash) {
            effects.consume(code);
            return commentOpenInside;
        }

        if (code === codes.leftSquareBracket) {
            effects.consume(code);
            index = 0;
            return cdataOpenInside;
        }

        if (asciiAlpha(code)) {
            effects.consume(code);
            return declaration;
        }

        return nok(code);
    }

    /**
     * In a comment, after `<!-`, at another `-`.
     *
     * ```markdown
     * > | a <!--b--> c
     *          ^
     * ```
     *
     */
    function commentOpenInside(code: Code) {
        if (code === codes.dash) {
            effects.consume(code);
            return commentEnd;
        }

        return nok(code);
    }

    /**
     * In comment.
     *
     * ```markdown
     * > | a <!--b--> c
     *           ^
     * ```
     *
     */
    function comment(code: Code) {
        if (code === codes.eof) {
            return nok(code);
        }

        if (code === codes.dash) {
            effects.consume(code);
            return commentClose;
        }

        if (markdownLineEnding(code)) {
            returnState = comment;
            return lineEndingBefore(code);
        }

        effects.consume(code);
        return comment;
    }

    /**
     * In comment, after `-`.
     *
     * ```markdown
     * > | a <!--b--> c
     *             ^
     * ```
     *
     */
    function commentClose(code: Code) {
        if (code === codes.dash) {
            effects.consume(code);
            return commentEnd;
        }

        return comment(code);
    }

    /**
     * In comment, after `--`.
     *
     * ```markdown
     * > | a <!--b--> c
     *              ^
     * ```
     *
     */
    function commentEnd(code: Code) {
        return code === codes.greaterThan
            ? end(code)
            : code === codes.dash
              ? commentClose(code)
              : comment(code);
    }

    /**
     * After `<![`, in CDATA, expecting `CDATA[`.
     *
     * ```markdown
     * > | a <![CDATA[>&<]]> b
     *          ^^^^^^
     * ```
     *
     */
    function cdataOpenInside(code: Code) {
        const value = constants.cdataOpeningString;

        if (code === value.charCodeAt(index++)) {
            effects.consume(code);
            return index === value.length ? cdata : cdataOpenInside;
        }

        return nok(code);
    }

    /**
     * In CDATA.
     *
     * ```markdown
     * > | a <![CDATA[>&<]]> b
     *                ^^^
     * ```
     *
     */
    function cdata(code: Code) {
        if (code === codes.eof) {
            return nok(code);
        }

        if (code === codes.rightSquareBracket) {
            effects.consume(code);
            return cdataClose;
        }

        if (markdownLineEnding(code)) {
            returnState = cdata;
            return lineEndingBefore(code);
        }

        effects.consume(code);
        return cdata;
    }

    /**
     * In CDATA, after `]`, at another `]`.
     *
     * ```markdown
     * > | a <![CDATA[>&<]]> b
     *                    ^
     * ```
     *
     */
    function cdataClose(code: Code): State | undefined {
        if (code === codes.rightSquareBracket) {
            effects.consume(code);
            return cdataEnd;
        }

        return cdata(code);
    }

    /**
     * In CDATA, after `]]`, at `>`.
     *
     * ```markdown
     * > | a <![CDATA[>&<]]> b
     *                     ^
     * ```
     *
     */
    function cdataEnd(code: Code) {
        if (code === codes.greaterThan) {
            return end(code);
        }

        if (code === codes.rightSquareBracket) {
            effects.consume(code);
            return cdataEnd;
        }

        return cdata(code);
    }

    /**
     * In declaration.
     *
     * ```markdown
     * > | a <!b> c
     *          ^
     * ```
     *
     */
    function declaration(code: Code) {
        if (code === codes.eof || code === codes.greaterThan) {
            return end(code);
        }

        if (markdownLineEnding(code)) {
            returnState = declaration;
            return lineEndingBefore(code);
        }

        effects.consume(code);
        return declaration;
    }

    /**
     * In instruction.
     *
     * ```markdown
     * > | a <?b?> c
     *         ^
     * ```
     *
     */
    function instruction(code: Code): State | undefined {
        if (code === codes.eof) {
            return nok(code);
        }

        if (code === codes.questionMark) {
            effects.consume(code);
            return instructionClose;
        }

        if (markdownLineEnding(code)) {
            returnState = instruction;
            return lineEndingBefore(code);
        }

        effects.consume(code);
        return instruction;
    }

    /**
     * In instruction, after `?`, at `>`.
     *
     * ```markdown
     * > | a <?b?> c
     *           ^
     * ```
     *
     */
    function instructionClose(code: Code) {
        return code === codes.greaterThan ? end(code) : instruction(code);
    }

    /**
     * After `</`, in closing tag, at tag name.
     *
     * ```markdown
     * > | a </b> c
     *         ^
     * ```
     *
     */
    function tagCloseStart(code: Code) {
        // ASCII alphabetical.
        if (asciiAlpha(code)) {
            effects.consume(code);
            return tagClose;
        }

        return nok(code);
    }

    /**
     * After `</x`, in a tag name.
     *
     * ```markdown
     * > | a </b> c
     *          ^
     * ```
     *
     */
    function tagClose(code: Code) {
        // ASCII alphanumerical and `-`.
        if (code === codes.dash || asciiAlphanumeric(code)) {
            effects.consume(code);
            return tagClose;
        }

        return tagCloseBetween(code);
    }

    /**
     * In closing tag, after tag name.
     *
     * ```markdown
     * > | a </b> c
     *          ^
     * ```
     *
     */
    function tagCloseBetween(code: Code) {
        if (markdownLineEnding(code)) {
            returnState = tagCloseBetween;
            return lineEndingBefore(code);
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return tagCloseBetween;
        }

        return end(code);
    }

    /**
     * After `<x`, in opening tag name.
     *
     * ```markdown
     * > | a <b> c
     *         ^
     * ```
     *
     */
    function tagOpen(code: Code) {
        // ASCII alphanumerical and `-`.
        if (code === codes.dash || asciiAlphanumeric(code)) {
            effects.consume(code);
            return tagOpen;
        }

        if (
            code === codes.slash ||
            code === codes.greaterThan ||
            markdownLineEndingOrSpace(code)
        ) {
            return tagOpenBetween(code);
        }

        return nok(code);
    }

    /**
     * In opening tag, after tag name.
     *
     * ```markdown
     * > | a <b> c
     *         ^
     * ```
     *
     */
    function tagOpenBetween(code: Code): State | undefined {
        if (code === codes.slash) {
            effects.consume(code);
            return end;
        }

        // ASCII alphabetical and `:` and `_`.
        if (
            code === codes.colon ||
            code === codes.underscore ||
            asciiAlpha(code)
        ) {
            effects.consume(code);
            return tagOpenAttributeName;
        }

        if (markdownLineEnding(code)) {
            returnState = tagOpenBetween;
            return lineEndingBefore(code);
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return tagOpenBetween;
        }

        return end(code);
    }

    /**
     * In attribute name.
     *
     * ```markdown
     * > | a <b c> d
     *          ^
     * ```
     *
     */
    function tagOpenAttributeName(code: Code) {
        // ASCII alphabetical and `-`, `.`, `:`, and `_`.
        if (
            code === codes.dash ||
            code === codes.dot ||
            code === codes.colon ||
            code === codes.underscore ||
            asciiAlphanumeric(code)
        ) {
            effects.consume(code);
            return tagOpenAttributeName;
        }

        return tagOpenAttributeNameAfter(code);
    }

    /**
     * After attribute name, before initializer, the end of the tag, or
     * whitespace.
     *
     * ```markdown
     * > | a <b c> d
     *           ^
     * ```
     *
     */
    function tagOpenAttributeNameAfter(code: Code) {
        if (code === codes.equalsTo) {
            effects.consume(code);
            return tagOpenAttributeValueBefore;
        }

        if (markdownLineEnding(code)) {
            returnState = tagOpenAttributeNameAfter;
            return lineEndingBefore(code);
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return tagOpenAttributeNameAfter;
        }

        return tagOpenBetween(code);
    }

    /**
     * Before unquoted, double quoted, or single quoted attribute value, allowing
     * whitespace.
     *
     * ```markdown
     * > | a <b c=d> e
     *            ^
     * ```
     *
     */
    function tagOpenAttributeValueBefore(code: Code) {
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
            marker = code;
            return tagOpenAttributeValueQuoted;
        }

        if (markdownLineEnding(code)) {
            returnState = tagOpenAttributeValueBefore;
            return lineEndingBefore(code);
        }

        if (markdownSpace(code)) {
            effects.consume(code);
            return tagOpenAttributeValueBefore;
        }

        effects.consume(code);
        return tagOpenAttributeValueUnquoted;
    }

    /**
     * In double or single quoted attribute value.
     *
     * ```markdown
     * > | a <b c="d"> e
     *             ^
     * ```
     *
     */
    function tagOpenAttributeValueQuoted(code: Code) {
        if (code === marker) {
            effects.consume(code);
            marker = undefined;
            return tagOpenAttributeValueQuotedAfter;
        }

        if (code === codes.eof) {
            return nok(code);
        }

        if (markdownLineEnding(code)) {
            returnState = tagOpenAttributeValueQuoted;
            return lineEndingBefore(code);
        }

        effects.consume(code);
        return tagOpenAttributeValueQuoted;
    }

    /**
     * In unquoted attribute value.
     *
     * ```markdown
     * > | a <b c=d> e
     *            ^
     * ```
     *
     */
    function tagOpenAttributeValueUnquoted(code: Code) {
        if (
            code === codes.eof ||
            code === codes.quotationMark ||
            code === codes.apostrophe ||
            code === codes.lessThan ||
            code === codes.equalsTo ||
            code === codes.graveAccent
        ) {
            return nok(code);
        }

        if (
            code === codes.slash ||
            code === codes.greaterThan ||
            markdownLineEndingOrSpace(code)
        ) {
            return tagOpenBetween(code);
        }

        effects.consume(code);
        return tagOpenAttributeValueUnquoted;
    }

    /**
     * After double or single quoted attribute value, before whitespace or the end
     * of the tag.
     *
     * ```markdown
     * > | a <b c="d"> e
     *               ^
     * ```
     *
     */
    function tagOpenAttributeValueQuotedAfter(code: Code) {
        if (
            code === codes.slash ||
            code === codes.greaterThan ||
            markdownLineEndingOrSpace(code)
        ) {
            return tagOpenBetween(code);
        }

        return nok(code);
    }

    /**
     * In certain circumstances of a tag where only an `>` is allowed.
     *
     * ```markdown
     * > | a <b c="d"> e
     *               ^
     * ```
     *
     */
    function end(code: Code) {
        if (code === codes.greaterThan) {
            effects.consume(code);
            effects.exit(types.htmlTextData);
            effects.exit(types.htmlText);
            return ok;
        }

        return nok(code);
    }

    /**
     * At eol.
     *
     * > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
     * > empty tokens.
     *
     * ```markdown
     * > | a <!--a
     *            ^
     *   | b-->
     * ```
     *
     */
    function lineEndingBefore(code: Code) {
        assert(returnState, "expected return state");
        assert(markdownLineEnding(code), "expected eol");
        effects.exit(types.htmlTextData);
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return lineEndingAfter;
    }

    /**
     * After eol, at optional whitespace.
     *
     * > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
     * > empty tokens.
     *
     * ```markdown
     *   | a <!--a
     * > | b-->
     *     ^
     * ```
     *
     */
    function lineEndingAfter(code: Code) {
        // Always populated by defaults.
        assert(
            self.parser.constructs.disable.null,
            "expected `disable.null` to be populated",
        );
        return markdownSpace(code)
            ? factorySpace(
                  effects,
                  lineEndingAfterPrefix,
                  types.linePrefix,
                  self.parser.constructs.disable.null.includes("codeIndented")
                      ? undefined
                      : constants.tabSize,
              )(code)
            : lineEndingAfterPrefix(code);
    }

    /**
     * After eol, after optional whitespace.
     *
     * > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
     * > empty tokens.
     *
     * ```markdown
     *   | a <!--a
     * > | b-->
     *     ^
     * ```
     *
     */
    function lineEndingAfterPrefix(code: Code) {
        effects.enter(types.htmlTextData);
        return returnState(code);
    }
}
