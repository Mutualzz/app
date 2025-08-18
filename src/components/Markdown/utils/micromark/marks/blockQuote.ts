import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownSpace } from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const blockQuote: Construct = {
    continuation: { tokenize: tokenizeBlockQuoteContinuation },
    exit,
    name: "blockQuote",
    tokenize: tokenizeBlockQuoteStart,
};

function tokenizeBlockQuoteStart(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return start;

    /**
     * Start of block quote.
     *
     * ```markdown
     * > | > a
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        if (code === codes.greaterThan) {
            const state = self.containerState;

            assert(
                state,
                "expected `containerState` to be defined in container",
            );

            if (!state.open) {
                effects.enter(types.blockQuote, { _container: true });
                state.open = true;
            }

            effects.enter(types.blockQuotePrefix);
            effects.enter(types.blockQuoteMarker);
            effects.consume(code);
            effects.exit(types.blockQuoteMarker);
            return after;
        }

        return nok(code);
    }

    /**
     * After `>`, before optional whitespace.
     *
     * ```markdown
     * > | > a
     *      ^
     * ```
     *
     */
    function after(code: Code) {
        if (markdownSpace(code)) {
            effects.enter(types.blockQuotePrefixWhitespace);
            effects.consume(code);
            effects.exit(types.blockQuotePrefixWhitespace);
            effects.exit(types.blockQuotePrefix);
            return ok;
        }

        effects.exit(types.blockQuotePrefix);
        return nok(code);
    }
}

function tokenizeBlockQuoteContinuation(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return contStart;

    /**
     * Start of block quote continuation.
     *
     * Also used to parse the first block quote opening.
     *
     * ```markdown
     *   | > a
     * > | > b
     *     ^
     * ```
     *
     */
    function contStart(code: Code) {
        if (markdownSpace(code)) {
            // Always populated by defaults.
            assert(
                self.parser.constructs.disable.null,
                "expected `disable.null` to be populated",
            );

            return factorySpace(
                effects,
                contBefore,
                types.linePrefix,
                self.parser.constructs.disable.null.includes("codeIndented")
                    ? undefined
                    : constants.tabSize,
            )(code);
        }

        return contBefore(code);
    }

    /**
     * At `>`, after optional whitespace.
     *
     * Also used to parse the first block quote opening.
     *
     * ```markdown
     *   | > a
     * > | > b
     *     ^
     * ```
     *
     */
    function contBefore(code: Code) {
        return effects.attempt(blockQuote, ok, nok)(code);
    }
}

function exit(effects: Effects): undefined {
    effects.exit(types.blockQuote);
}
