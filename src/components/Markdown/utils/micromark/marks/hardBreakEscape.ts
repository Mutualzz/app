import { ok as assert } from "devlop";
import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const hardBreakEscape: Construct = {
    name: "hardBreakEscape",
    tokenize: tokenizeHardBreakEscape,
};

function tokenizeHardBreakEscape(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return start;

    /**
     * Start of a hard break (escape).
     *
     * ```markdown
     * > | a\
     *      ^
     *   | b
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.backslash, "expected `\\`");
        effects.enter(types.hardBreakEscape);
        effects.consume(code);
        return after;
    }

    /**
     * After `\`, at eol.
     *
     * ```markdown
     * > | a\
     *       ^
     *   | b
     * ```
     *
     */
    function after(code: Code) {
        if (markdownLineEnding(code)) {
            effects.exit(types.hardBreakEscape);
            return ok(code);
        }

        return nok(code);
    }
}
