import { ok as assert } from "devlop";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";
import { labelEnd } from "./labelEnd";

export const labelStartLink: Construct = {
    name: "labelStartLink",
    resolveAll: labelEnd.resolveAll,
    tokenize: tokenizeLabelStartLink,
};

function tokenizeLabelStartLink(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return start;

    /**
     * Start of label (link) start.
     *
     * ```markdown
     * > | a [b] c
     *       ^
     * ```
     *
     */
    function start(code: Code) {
        assert(code === codes.leftSquareBracket, "expected `[`");
        effects.enter(types.labelLink);
        effects.enter(types.labelMarker);
        effects.consume(code);
        effects.exit(types.labelMarker);
        effects.exit(types.labelLink);
        return after;
    }

    function after(code: Code) {
        // To do: this isn’t needed in `micromark-extension-gfm-footnote`,
        // remove.
        // Hidden footnotes hook.
        /* c8 ignore next 3 */
        return code === codes.caret &&
            "_hiddenFootnoteSupport" in self.parser.constructs
            ? nok(code)
            : ok(code);
    }
}
