import { subtokenize } from "micromark-util-subtokenize";
import type { Event } from "micromark-util-types";

export function postprocess(events: Event[]): Event[] {
    while (!subtokenize(events)) {
        // Empty
    }

    return events;
}
