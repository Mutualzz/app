import type {
    Code,
    Effects,
    Extension,
    State,
    TokenizeContext,
    Tokenizer,
} from "micromark-util-types";

import { codes } from "micromark-util-symbol";

export const strikethroughSyntax = function (): Extension {
    return {
        text: {
            [codes.tilde]: {
                name: "strikethrough",
                tokenize: tokenizeStrikethrough,
            },
        },
    };
};

const lookaheadConstruct = {
    partial: true,
    /** If the next two characters are `~~`, run `ok`, else `nok`. */
    tokenize(effects: Effects, ok: State, nok: State): State {
        return start;

        function start(code: Code) {
            // match first symbol `~`
            if (code !== codes.tilde) return nok(code);
            effects.consume(code);
            return lookaheadAt;
        }

        function lookaheadAt(code: Code) {
            // match second symbol `~`
            if (code !== codes.tilde) return nok(code);
            effects.consume(code);
            return ok(code);
        }
    },
};
const tokenizeStrikethrough: Tokenizer = function (
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
): State {
    return start;

    function start(code: Code): State | undefined {
        if (code === codes.tilde) {
            effects.enter("strikethrough");
            effects.enter("strikethroughMarker");
            effects.consume(code);
            return secondStart;
        }

        return nok(code);
    }

    function secondStart(code: Code): State | undefined {
        if (code === codes.tilde) {
            effects.consume(code);
            effects.exit("strikethroughMarker");

            return checkEmpty;
        }

        return nok(code);
    }

    function checkEmpty(code: Code): State | undefined {
        if (code === codes.tilde || code === null) return nok(code);

        effects.enter("data");
        return consumeContent(code);
    }

    function consumeContent(code: Code): State | undefined {
        // match first ending '~'
        if (code === codes.tilde) {
            return effects.check(
                lookaheadConstruct as any,
                firstEnd,
                consumeAsText,
            )(code);
        }

        if (code === null) return nok(code);

        effects.consume(code);
        return consumeContent;
    }

    function consumeAsText(code: Code): State | undefined {
        if (code === null) return nok(code);

        effects.consume(code);
        return consumeContent;
    }

    function firstEnd(code: Code): State | undefined {
        // match first ending '~'
        if (code === codes.tilde) {
            effects.exit("data");
            effects.enter("strikethroughMarker");
            effects.consume(code);
            return secondEnd;
        }

        return nok(code);
    }

    function secondEnd(code: Code): State | undefined {
        // match second ending '~'
        if (code === codes.tilde) {
            effects.consume(code);
            effects.exit("strikethroughMarker");
            effects.exit("strikethrough");
            return ok;
        }

        // invalid character
        return nok(code);
    }
};
