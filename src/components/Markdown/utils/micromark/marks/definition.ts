import { ok as assert } from "devlop";
import { factoryDestination } from "micromark-factory-destination";
import { factoryLabel } from "micromark-factory-label";
import { factorySpace } from "micromark-factory-space";
import { factoryTitle } from "micromark-factory-title";
import { factoryWhitespace } from "micromark-factory-whitespace";
import {
    markdownLineEnding,
    markdownLineEndingOrSpace,
    markdownSpace,
} from "micromark-util-character";
import { normalizeIdentifier } from "micromark-util-normalize-identifier";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const definition: Construct = {
    name: "definition",
    tokenize: tokenizeDefinition,
};

const titleBefore: Construct = { partial: true, tokenize: tokenizeTitleBefore };

function tokenizeDefinition(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    let identifier: string;

    return start;

    /**
     * At start of a definition.
     *
     * ```markdown
     * > | [a]: b "c"
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        // Do not interrupt paragraphs (but do follow definitions).
        // To do: do `interrupt` the way `markdown-rs` does.
        // To do: parse whitespace the way `markdown-rs` does.
        effects.enter(types.definition);
        return before(code);
    }

    /**
     * After optional whitespace, at `[`.
     *
     * ```markdown
     * > | [a]: b "c"
     *     ^
     * ```
     *
     */
    function before(code: Code) {
        // To do: parse whitespace the way `markdown-rs` does.
        assert(code === codes.leftSquareBracket, "expected `[`");
        return factoryLabel.call(
            self,
            effects,
            labelAfter,
            // Note: we don’t need to reset the way `markdown-rs` does.
            nok,
            types.definitionLabel,
            types.definitionLabelMarker,
            types.definitionLabelString,
        )(code);
    }

    /**
     * After label.
     *
     * ```markdown
     * > | [a]: b "c"
     *        ^
     * ```
     *
     */
    function labelAfter(code: Code) {
        identifier = normalizeIdentifier(
            self
                .sliceSerialize(self.events[self.events.length - 1][1])
                .slice(1, -1),
        );

        if (code === codes.colon) {
            effects.enter(types.definitionMarker);
            effects.consume(code);
            effects.exit(types.definitionMarker);
            return markerAfter;
        }

        return nok(code);
    }

    /**
     * After marker.
     *
     * ```markdown
     * > | [a]: b "c"
     *         ^
     * ```
     *
     */
    function markerAfter(code: Code) {
        // Note: whitespace is optional.
        return markdownLineEndingOrSpace(code)
            ? factoryWhitespace(effects, destinationBefore)(code)
            : destinationBefore(code);
    }

    /**
     * Before destination.
     *
     * ```markdown
     * > | [a]: b "c"
     *          ^
     * ```
     *
     */
    function destinationBefore(code: Code) {
        return factoryDestination(
            effects,
            destinationAfter,
            // Note: we don’t need to reset the way `markdown-rs` does.
            nok,
            types.definitionDestination,
            types.definitionDestinationLiteral,
            types.definitionDestinationLiteralMarker,
            types.definitionDestinationRaw,
            types.definitionDestinationString,
        )(code);
    }

    /**
     * After destination.
     *
     * ```markdown
     * > | [a]: b "c"
     *           ^
     * ```
     *
     */
    function destinationAfter(code: Code) {
        return effects.attempt(titleBefore, after, after)(code);
    }

    /**
     * After definition.
     *
     * ```markdown
     * > | [a]: b
     *           ^
     * > | [a]: b "c"
     *               ^
     * ```
     *
     */
    function after(code: Code) {
        return markdownSpace(code)
            ? factorySpace(effects, afterWhitespace, types.whitespace)(code)
            : afterWhitespace(code);
    }

    /**
     * After definition, after optional whitespace.
     *
     * ```markdown
     * > | [a]: b
     *           ^
     * > | [a]: b "c"
     *               ^
     * ```
     *
     */
    function afterWhitespace(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.definition);

            // Note: we don’t care about uniqueness.
            // It’s likely that that doesn’t happen very frequently.
            // It is more likely that it wastes precious time.
            self.parser.defined.push(identifier);

            // To do: `markdown-rs` interrupt.
            // // You’d be interrupting.
            // tokenizer.interrupt = true
            return ok(code);
        }

        return nok(code);
    }
}

function tokenizeTitleBefore(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return titleBefore;

    /**
     * After destination, at whitespace.
     *
     * ```markdown
     * > | [a]: b
     *           ^
     * > | [a]: b "c"
     *           ^
     * ```
     *
     */
    function titleBefore(code: Code) {
        return markdownLineEndingOrSpace(code)
            ? factoryWhitespace(effects, beforeMarker)(code)
            : nok(code);
    }

    /**
     * At title.
     *
     * ```markdown
     *   | [a]: b
     * > | "c"
     *     ^
     * ```
     *
     */
    function beforeMarker(code: Code) {
        return factoryTitle(
            effects,
            titleAfter,
            nok,
            types.definitionTitle,
            types.definitionTitleMarker,
            types.definitionTitleString,
        )(code);
    }

    /**
     * After title.
     *
     * ```markdown
     * > | [a]: b "c"
     *               ^
     * ```
     *
     */
    function titleAfter(code: Code) {
        return markdownSpace(code)
            ? factorySpace(
                  effects,
                  titleAfterOptionalWhitespace,
                  types.whitespace,
              )(code)
            : titleAfterOptionalWhitespace(code);
    }

    /**
     * After title, after optional whitespace.
     *
     * ```markdown
     * > | [a]: b "c"
     *               ^
     * ```
     *
     */
    function titleAfterOptionalWhitespace(code: Code) {
        return code === codes.eof || markdownLineEnding(code)
            ? ok(code)
            : nok(code);
    }
}
