import mergeWith from "lodash-es/mergeWith";

import type { Theme } from "@emotion/react";

export function mergeAppendAnything(
    ...objects: Record<string, string | string[]>[]
): Record<string, string[]> {
    return mergeWith({}, ...objects, (objValue: any, srcValue: any) => {
        const toArray = (val: string | string[]): string[] =>
            Array.isArray(val) ? val : [val];

        if (objValue !== undefined && srcValue !== undefined) {
            return Array.from(
                new Set(toArray(objValue).concat(toArray(srcValue))),
            );
        }

        return undefined;
    });
}
const getNavigator = () => {
    if (typeof window === "undefined") return null;
    if (typeof window.navigator === "undefined") return null;
    return window.navigator;
};

export function detectOS(): string {
    const navigator = getNavigator();
    if (!navigator) return "Other";
    if ("userAgentData" in navigator) {
        return (navigator as any).userAgentData.platform ?? "Other";
    }

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) return "Windows";
    if (userAgent.includes("mac")) return "macOS";
    if (userAgent.includes("linux")) return "Linux";

    return "Other";
}

export function detectBrowser(): string {
    const navigator = getNavigator();
    if (!navigator) return "Other";

    if ("userAgentData" in navigator) {
        return (navigator as any).userAgentData.brands?.[0]?.brand ?? "Other";
    }

    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    return "Other";
}

/**
 * Returns a boolan indicating if we are running in a tauri context
 */
export const isTauri =
    // @ts-expect-error no types
    typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

export const sortThemes = (themes: Theme[]): Theme[] => {
    const priorityOrder: string[] = ["baseDark", "baseLight"];

    const priorityThemes = themes.filter((theme) =>
        priorityOrder.includes(theme.id),
    );
    const otherThemes = themes
        .filter((theme) => !priorityOrder.includes(theme.id))
        .sort((a, b) => a.name.localeCompare(b.name));

    return [...priorityThemes, ...otherThemes];
};
