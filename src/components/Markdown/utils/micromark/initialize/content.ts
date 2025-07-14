import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Effects,
    InitialConstruct,
    State,
    Token,
    TokenizeContext,
} from "micromark-util-types";

export const content: InitialConstruct = { tokenize: initializeContent };

function initializeContent(this: TokenizeContext, effects: Effects): State {
    const contentStart = effects.attempt(
        this.parser.constructs.contentInitial,
        afterContentStartConstruct,
        paragraphInitial,
    );
    let previous: Token;

    return contentStart;

    function afterContentStartConstruct(code: Code) {
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
        return factorySpace(effects, contentStart, types.linePrefix);
    }

    function paragraphInitial(code: Code) {
        assert(
            code !== codes.eof && !markdownLineEnding(code),
            "expected anything other than a line ending or EOF",
        );
        effects.enter(types.paragraph);
        return lineStart(code);
    }

    function lineStart(code: Code) {
        const token = effects.enter(types.chunkText, {
            contentType: constants.contentTypeText,
            previous,
        });

        if (previous) {
            previous.next = token;
        }

        previous = token;

        return data(code);
    }

    function data(code: Code): State | undefined {
        if (code === codes.eof) {
            effects.exit(types.chunkText);
            effects.exit(types.paragraph);
            effects.consume(code);
            return;
        }

        if (markdownLineEnding(code)) {
            effects.consume(code);
            effects.exit(types.chunkText);
            return lineStart;
        }

        // Data.
        effects.consume(code);
        return data;
    }
}
