import { decodeNamedCharacterReference } from "decode-named-character-reference";
import { ok as assert } from "devlop";
import {
    asciiAlphanumeric,
    asciiDigit,
    asciiHexDigit,
} from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const characterReference: Construct = {
    name: "characterReference",
    tokenize: tokenizeCharacterReference,
};

function tokenizeCharacterReference(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    let size = 0;

    let max: number;

    let test: (code: Code) => boolean;

    return start;

    /**
     * Start of character reference.
     *
     * ```markdown
     * > | a&amp;b
     *      ^
     * > | a&#123;b
     *      ^
     * > | a&#x9;b
     *      ^
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.ampersand, "expected `&`");
        effects.enter(types.characterReference);
        effects.enter(types.characterReferenceMarker);
        effects.consume(code);
        effects.exit(types.characterReferenceMarker);
        return open;
    }

    /**
     * After `&`, at `#` for numeric references or alphanumeric for named
     * references.
     *
     * ```markdown
     * > | a&amp;b
     *       ^
     * > | a&#123;b
     *       ^
     * > | a&#x9;b
     *       ^
     * ```
     *
     */
    function open(code: Code) {
        if (code === codes.numberSign) {
            effects.enter(types.characterReferenceMarkerNumeric);
            effects.consume(code);
            effects.exit(types.characterReferenceMarkerNumeric);
            return numeric;
        }

        effects.enter(types.characterReferenceValue);
        max = constants.characterReferenceNamedSizeMax;
        test = asciiAlphanumeric;
        return value(code);
    }

    /**
     * After `#`, at `x` for hexadecimals or digit for decimals.
     *
     * ```markdown
     * > | a&#123;b
     *        ^
     * > | a&#x9;b
     *        ^
     * ```
     *
     */
    function numeric(code: Code) {
        if (code === codes.uppercaseX || code === codes.lowercaseX) {
            effects.enter(types.characterReferenceMarkerHexadecimal);
            effects.consume(code);
            effects.exit(types.characterReferenceMarkerHexadecimal);
            effects.enter(types.characterReferenceValue);
            max = constants.characterReferenceHexadecimalSizeMax;
            test = asciiHexDigit;
            return value;
        }

        effects.enter(types.characterReferenceValue);
        max = constants.characterReferenceDecimalSizeMax;
        test = asciiDigit;
        return value(code);
    }

    /**
     * After markers (`&#x`, `&#`, or `&`), in value, before `;`.
     *
     * The character reference kind defines what and how many characters are
     * allowed.
     *
     * ```markdown
     * > | a&amp;b
     *       ^^^
     * > | a&#123;b
     *        ^^^
     * > | a&#x9;b
     *         ^
     * ```
     *
     */
    function value(code: Code) {
        if (code === codes.semicolon && size) {
            const token = effects.exit(types.characterReferenceValue);

            if (
                test === asciiAlphanumeric &&
                !decodeNamedCharacterReference(self.sliceSerialize(token))
            ) {
                return nok(code);
            }

            // To do: `markdown-rs` uses a different name:
            // `CharacterReferenceMarkerSemi`.
            effects.enter(types.characterReferenceMarker);
            effects.consume(code);
            effects.exit(types.characterReferenceMarker);
            effects.exit(types.characterReference);
            return ok;
        }

        if (test(code) && size++ < max) {
            effects.consume(code);
            return value;
        }

        return nok(code);
    }
}
