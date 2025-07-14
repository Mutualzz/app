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

export const codeIndented: Construct = {
    name: "codeIndented",
    tokenize: tokenizeCodeIndented,
};

const furtherStart: Construct = {
    partial: true,
    tokenize: tokenizeFurtherStart,
};

function tokenizeCodeIndented(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;
    return start;

    /**
     * Start of code (indented).
     *
     * > **Parsing note**: it is not needed to check if this first line is a
     * > filled line (that it has a non-whitespace character), because blank lines
     * > are parsed already, so we never run into that.
     *
     * ```markdown
     * > |     aaa
     *     ^
     * ```
     *
     */
    function start(code: Code) {
        // To do: manually check if interrupting like `markdown-rs`.
        assert(markdownSpace(code));
        effects.enter(types.codeIndented);
        // To do: use an improved `space_or_tab` function like `markdown-rs`,
        // so that we can drop the next state.
        return factorySpace(
            effects,
            afterPrefix,
            types.linePrefix,
            constants.tabSize + 1,
        )(code);
    }

    /**
     * At start, after 1 or 4 spaces.
     *
     * ```markdown
     * > |     aaa
     *         ^
     * ```
     *
     */
    function afterPrefix(code: Code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
            tail[1].type === types.linePrefix &&
            tail[2].sliceSerialize(tail[1], true).length >= constants.tabSize
            ? atBreak(code)
            : nok(code);
    }

    /**
     * At a break.
     *
     * ```markdown
     * > |     aaa
     *         ^  ^
     * ```
     *
     */
    function atBreak(code: Code): State | undefined {
        if (code === codes.eof) {
            return after(code);
        }

        if (markdownLineEnding(code)) {
            return effects.attempt(furtherStart, atBreak, after)(code);
        }

        effects.enter(types.codeFlowValue);
        return inside(code);
    }

    /**
     * In code content.
     *
     * ```markdown
     * > |     aaa
     *         ^^^^
     * ```
     *
     */
    function inside(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            effects.exit(types.codeFlowValue);
            return atBreak(code);
        }

        effects.consume(code);
        return inside;
    }

    function after(code: Code) {
        effects.exit(types.codeIndented);
        // To do: allow interrupting like `markdown-rs`.
        // Feel free to interrupt.
        // tokenizer.interrupt = false
        return ok(code);
    }
}

function tokenizeFurtherStart(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return furtherStart;

    /**
     * At eol, trying to parse another indent.
     *
     * ```markdown
     * > |     aaa
     *            ^
     *   |     bbb
     * ```
     *
     */
    function furtherStart(code: Code) {
        // To do: improve `lazy` / `pierce` handling.
        // If this is a lazy line, it can’t be code.
        if (self.parser.lazy[self.now().line]) {
            return nok(code);
        }

        if (markdownLineEnding(code)) {
            effects.enter(types.lineEnding);
            effects.consume(code);
            effects.exit(types.lineEnding);
            return furtherStart;
        }

        // To do: the code here in `micromark-js` is a bit different from
        // `markdown-rs` because there it can attempt spaces.
        // We can’t yet.
        //
        // To do: use an improved `space_or_tab` function like `markdown-rs`,
        // so that we can drop the next state.
        return factorySpace(
            effects,
            afterPrefix,
            types.linePrefix,
            constants.tabSize + 1,
        )(code);
    }

    /**
     * At start, after 1 or 4 spaces.
     *
     * ```markdown
     * > |     aaa
     *         ^
     * ```
     *
     */
    function afterPrefix(code: Code) {
        const tail = self.events[self.events.length - 1];
        return tail &&
            tail[1].type === types.linePrefix &&
            tail[2].sliceSerialize(tail[1], true).length >= constants.tabSize
            ? ok(code)
            : markdownLineEnding(code)
              ? furtherStart(code)
              : nok(code);
    }
}
