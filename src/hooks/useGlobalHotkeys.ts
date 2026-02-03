import { useEffect, useRef } from "react";
import isHotkey from "is-hotkey";

interface HotkeyMap {
    [combo: string]: (e: KeyboardEvent) => void;
}

export const useGlobalHotkeys = (combos: HotkeyMap) => {
    const combosRef = useRef(combos);

    useEffect(() => {
        combosRef.current = combos;
    }, [combos]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const map = combosRef.current;

            for (const combo in map) {
                if (isHotkey(combo, e)) {
                    e.preventDefault(); // stop browser/tauri default action
                    map[combo](e);
                    return;
                }
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);
};
