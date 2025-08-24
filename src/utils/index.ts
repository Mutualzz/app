import type { MzTheme } from "@app-types/theme";
import { Capacitor } from "@capacitor/core";
import mergeWith from "lodash-es/mergeWith";
import { isValidElement, type ReactNode } from "react";

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

export const isSSR = typeof window === "undefined";

/**
 * Returns a boolan indicating if we are running in a tauri context
 */
export const isTauri =
    // @ts-expect-error no types
    !isSSR && !!window.__TAURI_INTERNALS__;

export const isMobile = !isSSR && Capacitor.isNativePlatform();

export const sortThemes = (themes: MzTheme[]): MzTheme[] => {
    const priorityOrder: string[] = ["baseDark", "baseLight"];

    const priorityThemes = themes.filter((theme) =>
        priorityOrder.includes(theme.id),
    );
    const otherThemes = themes
        .filter((theme) => !priorityOrder.includes(theme.id))
        .sort((a, b) => a.name.localeCompare(b.name));

    return [...priorityThemes, ...otherThemes];
};

export function reactNodeToHtml(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number")
        return String(node);
    if (node === null || node === undefined || typeof node === "boolean")
        return "";
    if (Array.isArray(node)) return node.map(reactNodeToHtml).join("");

    if (isValidElement(node)) {
        const { type, props } = node;

        if (typeof type === "string") {
            // native HTML element
            const children = reactNodeToHtml((props as any).children);
            const attrs = Object.entries(props as any)
                .filter(([k]) => k !== "children")
                .map(([k, v]) => ` ${k}="${v}"`)
                .join("");
            return `<${type}${attrs}>${children}</${type}>`;
        }

        // For custom components: either recurse or bail
        return reactNodeToHtml((props as any).children);
    }

    return "";
}
