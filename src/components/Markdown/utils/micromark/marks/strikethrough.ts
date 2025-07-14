import { ok as assert } from "devlop";

import { splice } from "micromark-util-chunked";
import { resolveAll } from "micromark-util-resolve-all";
import { codes } from "micromark-util-symbol";
import type {
    Code,
    Construct,
    Effects,
    Event,
    State,
    TokenizeContext,
} from "micromark-util-types";
2;

export const strikethrough: Construct = {
    name: "strikethrough",
    resolveAll: resolveAllStrikethrough,
    tokenize: tokenizeStrikethrough,
};

function resolveAllStrikethrough(
    events: Event[],
    context: TokenizeContext,
): Event[] {
    let index = -1;

    while (++index < events.length) {
        if (
            events[index][0] === "enter" &&
            events[index][1].type === "strikethroughSequence" &&
            events[index][1]._close
        ) {
            let open = index;

            while (open--) {
                if (
                    events[open][0] === "exit" &&
                    events[open][1].type === "strikethroughSequence" &&
                    events[open][1]._open &&
                    context.sliceSerialize(events[open][1]).charCodeAt(0) ===
                        context.sliceSerialize(events[index][1]).charCodeAt(0)
                ) {
                    // Check if both sequences are exactly 2 tildes
                    const openingContent = context.sliceSerialize(
                        events[open][1],
                    );
                    const closingContent = context.sliceSerialize(
                        events[index][1],
                    );

                    if (openingContent !== "~~" || closingContent !== "~~") {
                        continue;
                    }

                    // Check if content between contains tildes
                    const contentEvents = events.slice(open + 1, index);
                    let hasUnderscore = false;

                    for (const event of contentEvents) {
                        if (event[1].type === "data") {
                            const content = context.sliceSerialize(event[1]);
                            if (content.includes("_")) {
                                hasUnderscore = true;
                                break;
                            }
                        }
                    }

                    if (hasUnderscore) {
                        continue;
                    }

                    const openingSequence = {
                        type: "strikethroughSequence",
                        start: { ...events[open][1].start },
                        end: { ...events[open][1].end },
                    };

                    const closingSequence = {
                        type: "strikethroughSequence",
                        start: { ...events[index][1].start },
                        end: { ...events[index][1].end },
                    };
                    const text = {
                        type: "strikethroughText",
                        start: { ...events[open][1].end },
                        end: { ...events[index][1].start },
                    };
                    const group = {
                        type: "strikethrough",
                        start: { ...openingSequence.start },
                        end: { ...closingSequence.end },
                    };

                    const nextEvents = [
                        ["enter", group, context],
                        ["enter", text, context],
                        ...resolveAll(
                            context.parser.constructs.insideSpan.null as any,
                            events.slice(open + 1, index),
                            context,
                        ),
                        ["exit", text, context],
                        ["exit", group, context],
                    ];

                    splice(events, open - 1, index - open + 3, nextEvents);
                    index = open + nextEvents.length - 2;
                    break;
                }
            }
        }
    }

    index = -1;
    while (++index < events.length) {
        if (events[index][1].type === "strikethroughSequence") {
            events[index][1].type = "data";
        }
    }

    return events;
}

function tokenizeStrikethrough(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const strikethroughMarkers =
        this.parser.constructs.strikethroughMarkers.null;
    let marker: NonNullable<Code>;
    let count = 0;

    return start;

    function start(code: Code) {
        assert(code === codes.tilde, "expected tilde");
        marker = code;
        effects.enter("strikethroughSequence");
        effects.consume(code);
        count = 1;
        return inside;
    }

    function inside(code: Code) {
        if (code === marker && count === 1) {
            // Second tilde
            effects.consume(code);
            count = 2;
            return checkEnd;
        }

        // Not a second tilde - this is not a valid strikethrough sequence
        // Exit the sequence and return nok to let it be handled as regular text
        effects.exit("strikethroughSequence");
        return nok(code);
    }

    function checkEnd(code: Code) {
        if (code === marker) {
            // Third tilde - not valid for our 2-tilde pattern
            effects.exit("strikethroughSequence");
            return nok(code);
        }

        // Exactly 2 tildes, check if valid
        const token = effects.exit("strikethroughSequence");

        assert(
            strikethroughMarkers,
            "expected `strikethroughMarkers` to be populated",
        );

        token._open = true;
        token._close = true;
        return ok(code);
    }
}
