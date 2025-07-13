import type {
    Code,
    Effects,
    Extension,
    State,
    TokenizeContext,
    Tokenizer,
} from "micromark-util-types";

import { codes } from "micromark-util-symbol";

export const underlineSyntax = function (): Extension {
    return {
        text: {
            [codes.underscore]: {
                name: "underline",
                tokenize: tokenizeUnderline,
            },
        },
    };
};

const lookaheadConstruct = {
    partial: true,
    /** If the next two characters are `__`, run `ok`, else `nok`. */
    tokenize(effects: Effects, ok: State, nok: State): State {
        return start;

        function start(code: Code) {
            // match first symbol `_`
            if (code !== codes.underscore) return nok(code);
            effects.consume(code);
            return lookaheadAt;
        }

        function lookaheadAt(code: Code) {
            // match second symbol `_`
            if (code !== codes.underscore) return nok(code);
            effects.consume(code);
            return ok(code);
        }
    },
};
const tokenizeUnderline: Tokenizer = function (
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
): State {
    return start;

    function start(code: Code): State | undefined {
        if (code === codes.underscore) {
            effects.enter("underline");
            effects.enter("underlineMarker");
            effects.consume(code);
            return secondStart;
        }

        return nok(code);
    }

    function secondStart(code: Code): State | undefined {
        if (code === codes.underscore) {
            effects.consume(code);
            effects.exit("underlineMarker");

            return checkEmpty;
        }

        return nok(code);
    }

    function checkEmpty(code: Code): State | undefined {
        if (code === codes.underscore || code === null) return nok(code);

        effects.enter("data");
        return consumeContent(code);
    }

    function consumeContent(code: Code): State | undefined {
        // match first ending '_'
        if (code === codes.underscore) {
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
        // match first ending '_'
        if (code === codes.underscore) {
            effects.exit("data");
            effects.enter("underlineMarker");
            effects.consume(code);
            return secondEnd;
        }

        return nok(code);
    }

    function secondEnd(code: Code): State | undefined {
        // match second ending '_'
        if (code === codes.underscore) {
            effects.consume(code);
            effects.exit("underlineMarker");
            effects.exit("underline");
            return ok;
        }

        // invalid character
        return nok(code);
    }
};
