import { ok as assert } from "devlop";
import { factorySpace } from "micromark-factory-space";
import { markdownLineEnding } from "micromark-util-character";
import { subtokenize } from "micromark-util-subtokenize";
import { codes, constants, types } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    Event,
    State,
    Token,
    TokenizeContext,
} from "micromark-util-types";

export const content: Construct = {
    resolve: resolveContent,
    tokenize: tokenizeContent,
};

const continuationConstruct: Construct = {
    partial: true,
    tokenize: tokenizeContinuation,
};

function resolveContent(events: Event[]) {
    subtokenize(events);
    return events;
}

function tokenizeContent(this: TokenizeContext, effects: Effects, ok: State) {
    let previous: Token | undefined;

    return chunkStart;

    /**
     * Before a content chunk.
     *
     * ```markdown
     * > | abc
     *     ^
     * ```
     *
     */
    function chunkStart(code: Code) {
        assert(
            code !== codes.eof && !markdownLineEnding(code),
            "expected no eof or eol",
        );

        effects.enter(types.content);
        previous = effects.enter(types.chunkContent, {
            contentType: constants.contentTypeContent,
        });
        return chunkInside(code);
    }

    /**
     * In a content chunk.
     *
     * ```markdown
     * > | abc
     *     ^^^
     * ```
     *
     */
    function chunkInside(code: Code) {
        if (code === codes.eof) {
            return contentEnd(code);
        }

        // To do: in `markdown-rs`, each line is parsed on its own, and everything
        // is stitched together resolving.
        if (markdownLineEnding(code)) {
            return effects.check(
                continuationConstruct,
                contentContinue,
                contentEnd,
            )(code);
        }

        // Data.
        effects.consume(code);
        return chunkInside;
    }

    /**
     *
     *
     */
    function contentEnd(code: Code) {
        effects.exit(types.chunkContent);
        effects.exit(types.content);
        return ok(code);
    }

    /**
     *
     *
     */
    function contentContinue(code: Code) {
        assert(markdownLineEnding(code), "expected eol");
        effects.consume(code);
        effects.exit(types.chunkContent);
        assert(previous, "expected previous token");
        previous.next = effects.enter(types.chunkContent, {
            contentType: constants.contentTypeContent,
            previous,
        });
        previous = previous.next;
        return chunkInside;
    }
}

function tokenizeContinuation(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const self = this;

    return startLookahead;

    /**
     *
     *
     */
    function startLookahead(code: Code) {
        assert(markdownLineEnding(code), "expected a line ending");
        effects.exit(types.chunkContent);
        effects.enter(types.lineEnding);
        effects.consume(code);
        effects.exit(types.lineEnding);
        return factorySpace(effects, prefixed, types.linePrefix);
    }

    /**
     *
     *
     */
    function prefixed(code: Code) {
        if (code === codes.eof || markdownLineEnding(code)) {
            return nok(code);
        }

        // Always populated by defaults.
        assert(
            self.parser.constructs.disable.null,
            "expected `disable.null` to be populated",
        );

        const tail = self.events[self.events.length - 1];

        if (
            !self.parser.constructs.disable.null.includes("codeIndented") &&
            tail &&
            tail[1].type === types.linePrefix &&
            tail[2].sliceSerialize(tail[1], true).length >= constants.tabSize
        ) {
            return ok(code);
        }

        return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
    }
}
