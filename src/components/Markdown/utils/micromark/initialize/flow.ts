import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import { codes, types } from "micromark-util-symbol";
import type {
    Code,
    Effects,
    InitialConstruct,
    TokenizeContext,
} from "micromark-util-types";
import { blankLine } from "../marks/blankLine";
import { content } from "../marks/content";

export const flow: InitialConstruct = { tokenize: initializeFlow };

function initializeFlow(this: TokenizeContext, effects: Effects) {
    const self = this;

    const initial = effects.attempt(
        // Try to parse a blank line.
        blankLine,
        atBlankEnding,
        // Try to parse initial flow (essentially, only code).
        effects.attempt(
            this.parser.constructs.flowInitial,
            afterConstruct,
            factorySpace(
                effects,
                effects.attempt(
                    this.parser.constructs.flow,
                    afterConstruct,
                    effects.attempt(content, afterConstruct),
                ),
                types.linePrefix,
            ),
        ),
    );

    return initial;

    function atBlankEnding(code: Code) {
        assert(
            code === codes.eof || markdownLineEnding(code),
            "expected eol or eof",
        );

        if (code === codes.eof) {
            effects.consume(code);
            return;
        }

        effects.enter(types.lineEndingBlank);
        effects.consume(code);
        effects.exit(types.lineEndingBlank);
        self.currentConstruct = undefined;
        return initial;
    }

    function afterConstruct(code: Code) {
        assert(
            code === codes.eof || markdownLineEnding(code),
            "expected eol or eof",
        );

        if (code === codes.eof) {
            effects.consume(code);
            return;
        }

        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        self.currentConstruct = undefined;
        return initial;
    }
}
