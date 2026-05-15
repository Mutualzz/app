import { blockNavHotkeys } from "@hooks/blockers/blockNavHotkeys";
import { blockMouseHotkeys } from "@hooks/blockers/blockMouseHotkeys";

export const loadBlockers = () => {
    const cleanups = [blockNavHotkeys(), blockMouseHotkeys()];
    return () => cleanups.forEach((c) => c?.());
};
