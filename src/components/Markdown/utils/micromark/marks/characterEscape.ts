import { ok as assert } from "devlop";
import { asciiPunctuation } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const characterEscape: Construct = {
    name: "characterEscape",
    tokenize: tokenizeCharacterEscape,
};

function tokenizeCharacterEscape(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    return start;

    /**
     * Start of character escape.
     *
     * ```markdown
     * > | a\*b
     *      ^
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.backslash, "expected `\\`");
        effects.enter(types.characterEscape);
        effects.enter(types.escapeMarker);
        effects.consume(code);
        effects.exit(types.escapeMarker);
        return inside;
    }

    /**
     * After `\`, at punctuation.
     *
     * ```markdown
     * > | a\*b
     *       ^
     * ```
     *
     */
    function inside(code: Code) {
        // ASCII punctuation.
        if (asciiPunctuation(code)) {
            effects.enter(types.characterEscapeValue);
            effects.consume(code);
            effects.exit(types.characterEscapeValue);
            effects.exit(types.characterEscape);
            return ok;
        }

        return nok(code);
    }
}
