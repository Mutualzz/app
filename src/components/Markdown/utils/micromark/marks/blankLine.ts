import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding, markdownSpace } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const blankLine: Construct = {
    partial: true,
    tokenize: tokenizeBlankLine,
};

function tokenizeBlankLine(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return start;

    /**
     * Start of blank line.
     *
     * > 👉 **Note**: `␠` represents a space character.
     *
     * ```markdown
     * > | ␠␠␊
     *     ^
     * > | ␊
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        return markdownSpace(code)
            ? factorySpace(effects, after, types.linePrefix)(code)
            : after(code);
    }

    /**
     * At eof/eol, after optional whitespace.
     *
     * > 👉 **Note**: `␠` represents a space character.
     *
     * ```markdown
     * > | ␠␠␊
     *       ^
     * > | ␊
     *     ^
     * ```
     *
     */
    function after(code: Code) {
        return code === codes.eof || markdownLineEnding(code)
            ? ok(code)
            : nok(code);
    }
}
