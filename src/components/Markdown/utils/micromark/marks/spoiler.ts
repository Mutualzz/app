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

export const spoiler: Construct = {
    name: "spoiler",
    resolveAll: resolveAllSpoiler,
    tokenize: tokenizeSpoiler,
};

function resolveAllSpoiler(events: Event[], context: TokenizeContext): Event[] {
    let index = -1;

    while (++index < events.length) {
        if (
            events[index][0] === "enter" &&
            events[index][1].type === "spoilerSequence" &&
            events[index][1]._close
        ) {
            let open = index;

            while (open--) {
                if (
                    events[open][0] === "exit" &&
                    events[open][1].type === "spoilerSequence" &&
                    events[open][1]._open &&
                    context.sliceSerialize(events[open][1]).charCodeAt(0) ===
                        context.sliceSerialize(events[index][1]).charCodeAt(0)
                ) {
                    // Check if both sequences are exactly 2 verticalBars
                    const openingContent = context.sliceSerialize(
                        events[open][1],
                    );
                    const closingContent = context.sliceSerialize(
                        events[index][1],
                    );

                    if (openingContent !== "||" || closingContent !== "||") {
                        continue;
                    }

                    // Check if content between contains verticalBars
                    const contentEvents = events.slice(open + 1, index);
                    let hasVerticalBar = false;

                    for (const event of contentEvents) {
                        if (event[1].type === "data") {
                            const content = context.sliceSerialize(event[1]);
                            if (content.includes("|")) {
                                hasVerticalBar = true;
                                break;
                            }
                        }
                    }

                    if (hasVerticalBar) {
                        continue;
                    }

                    const openingSequence = {
                        type: "spoilerSequence",
                        start: { ...events[open][1].start },
                        end: { ...events[open][1].end },
                    };

                    const closingSequence = {
                        type: "spoilerSequence",
                        start: { ...events[index][1].start },
                        end: { ...events[index][1].end },
                    };
                    const text = {
                        type: "spoilerText",
                        start: { ...events[open][1].end },
                        end: { ...events[index][1].start },
                    };
                    const group = {
                        type: "spoiler",
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
        if (events[index][1].type === "spoilerSequence") {
            events[index][1].type = "data";
        }
    }

    return events;
}

function tokenizeSpoiler(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
) {
    const spoilerMarkers = this.parser.constructs.spoilerMarkers.null;
    let marker: NonNullable<Code>;
    let count = 0;

    return start;

    function start(code: Code) {
        assert(code === codes.verticalBar, "expected verticalBar");
        marker = code;
        effects.enter("spoilerSequence");
        effects.consume(code);
        count = 1;
        return inside;
    }

    function inside(code: Code) {
        if (code === marker && count === 1) {
            // Second verticalBar
            effects.consume(code);
            count = 2;
            return checkEnd;
        }

        // Not a second verticalBar - this is not a valid spoiler sequence
        // Exit the sequence and return nok to let it be handled as regular text
        effects.exit("spoilerSequence");
        return nok(code);
    }

    function checkEnd(code: Code) {
        if (code === marker) {
            // Third verticalBar - not valid for our 2-verticalBar pattern
            effects.exit("spoilerSequence");
            return nok(code);
        }

        // Exactly 2 verticalBars, check if valid
        const token = effects.exit("spoilerSequence");

        assert(spoilerMarkers, "expected `spoilerMarkers` to be populated");

        token._open = true;
        token._close = true;
        return ok(code);
    }
}
