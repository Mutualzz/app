import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding, markdownSpace } from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const thematicBreak: Construct = {
    name: "thematicBreak",
    tokenize: tokenizeThematicBreak,
};

function tokenizeThematicBreak(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    let size = 0;
    let marker: NonNullable<Code>;

    return start;

    /**
     * Start of thematic break.
     *
     * ```markdown
     * > | ***
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        effects.enter(types.thematicBreak);
        // To do: parse indent like `markdown-rs`.
        return before(code);
    }

    /**
     * After optional whitespace, at marker.
     *
     * ```markdown
     * > | ***
     *     ^
     * ```
     *
     */
    function before(code: Code) {
        assert(
            code === codes.asterisk ||
                code === codes.dash ||
                code === codes.underscore,
            "expected `*`, `-`, or `_`",
        );
        marker = code;
        return atBreak(code);
    }

    /**
     * After something, before something else.
     *
     * ```markdown
     * > | ***
     *     ^
     * ```
     *
     */
    function atBreak(code: Code): State | undefined {
        if (code === marker) {
            effects.enter(types.thematicBreakSequence);
            return sequence(code);
        }

        if (
            size >= constants.thematicBreakMarkerCountMin &&
            (code === codes.eof || markdownLineEnding(code))
        ) {
            effects.exit(types.thematicBreak);
            return ok(code);
        }

        return nok(code);
    }

    /**
     * In sequence.
     *
     * ```markdown
     * > | ***
     *     ^
     * ```
     *
     */
    function sequence(code: Code) {
        if (code === marker) {
            effects.consume(code);
            size++;
            return sequence;
        }

        effects.exit(types.thematicBreakSequence);
        return markdownSpace(code)
            ? factorySpace(effects, atBreak, types.whitespace)(code)
            : atBreak(code);
    }
}
