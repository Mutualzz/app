import { codes } from "micromark-util-symbol";
import type {
    Code,
    Effects,
    Extension,
    State,
    TokenizeContext,
    Tokenizer,
} from "micromark-util-types";

export const spoilerSyntax = function (): Extension {
    return {
        text: {
            [codes.verticalBar]: {
                name: "spoiler",
                tokenize: tokenizeSpoiler,
            },
        },
    };
};

const lookaheadConstruct = {
    partial: true,
    /** If the next two characters are `||`, run `ok`, else `nok`. */
    tokenize(effects: Effects, ok: State, nok: State): State {
        return start;

        function start(code: Code) {
            // match first symbol `|`
            if (code !== codes.verticalBar) return nok(code);
            effects.consume(code);
            return lookaheadAt;
        }

        function lookaheadAt(code: Code) {
            // match second symbol `|`
            if (code !== codes.verticalBar) return nok(code);
            effects.consume(code);
            return ok(code);
        }
    },
};
const tokenizeSpoiler: Tokenizer = function (
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
): State {
    return start;

    function start(code: Code): State | undefined {
        if (code === codes.verticalBar) {
            effects.enter("spoiler");
            effects.enter("spoilerMarker");
            effects.consume(code);
            return secondStart;
        }

        return nok(code);
    }

    function secondStart(code: Code): State | undefined {
        if (code === codes.verticalBar) {
            effects.consume(code);
            effects.exit("spoilerMarker");

            return checkEmpty;
        }

        return nok(code);
    }

    function checkEmpty(code: Code): State | undefined {
        if (code === codes.verticalBar || code === null) return nok(code);

        effects.enter("data");
        return consumeContent(code);
    }

    function consumeContent(code: Code): State | undefined {
        // match first ending '|'
        if (code === codes.verticalBar) {
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
        // match first ending '|'
        if (code === codes.verticalBar) {
            effects.exit("data");
            effects.enter("spoilerMarker");
            effects.consume(code);
            return secondEnd;
        }

        return nok(code);
    }

    function secondEnd(code: Code): State | undefined {
        // match second ending '|'
        if (code === codes.verticalBar) {
            effects.consume(code);
            effects.exit("spoilerMarker");
            effects.exit("spoiler");
            return ok;
        }

        // invalid character
        return nok(code);
    }
};
