import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import { types } from "micromark-util-symbol";
import type {
    Code,
    Effects,
    State,
    TokenizeContext,
} from "micromark-util-types";

export const lineEnding = { name: "lineEnding", tokenize: tokenizeLineEnding };

function tokenizeLineEnding(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
) {
    return start;

    function start(code: Code) {
        assert(markdownLineEnding(code), "expected eol");
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return factorySpace(effects, ok, types.linePrefix);
    }
}
