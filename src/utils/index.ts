import type { Theme as MzTheme } from "@emotion/react";
import type { AppStore } from "@stores/App.store";
import { Theme } from "@stores/objects/Theme";
import type { useNavigate } from "@tanstack/react-router";
import mergeWith from "lodash-es/mergeWith";
import { isValidElement, type ReactNode } from "react";
import MurmurHash from "imurmurhash";
import type { PresenceStatus } from "@mutualzz/types";

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

export const formatPresenceStatus = (status: PresenceStatus) => {
    switch (status) {
        case "online":
            return "Online";
        case "idle":
            return "Idle";
        case "dnd":
            return "Do Not Disturb";
        case "invisible":
            return "Invisible";
        case "offline":
        default:
            return "Offline";
    }
};

export const murmur = (input: string): string =>
    MurmurHash(input).result().toString();

export const toSpotifyUri = (u: URL): string | null => {
    if (u.hostname !== "open.spotify.com") return null;

    // /track/<id>, /album/<id>, /playlist/<id>, /artist/<id>, /show/<id>, /episode/<id>
    const parts = u.pathname.split("/").filter(Boolean);
    const type = parts[0];
    const id = parts[1];

    if (!type || !id) return null;
    return `spotify:${type}:${id}`;
};

export const asAcronym = (str: string) =>
    str
        .split(" ")
        .map((str) => str[0])
        .join("");

export const getIconType = (theme: MzTheme): string => {
    let iconUrl = "/icon.png";

    switch (theme.id) {
        case "baseDark":
        case "baseLight":
            iconUrl = "/icon.png";
            break;
        default:
            iconUrl = "/icon-adaptive.png";
            break;
    }

    return iconUrl;
};

export const isSSR = typeof window === "undefined";

/**
 * Returns a boolan indicating if we are running in a tauri context
 */
export const isTauri =
    // @ts-expect-error no types
    !isSSR && !!window.__TAURI_INTERNALS__;

export const canvasToArrayBuffer = (canvas: HTMLCanvasElement) =>
    new Promise<ArrayBuffer>((resolve, reject) =>
        canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("canvas.toBlob failed"));
            blob.arrayBuffer().then(resolve).catch(reject);
        }, "image/png"),
    );

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

export const switchMode = (
    app: AppStore,
    navigate?: ReturnType<typeof useNavigate>,
) => {
    if (app.mode === "feed") {
        if (navigate) {
            navigate({
                to: "/spaces",
                replace: true,
            });
        }
    }

    if (app.mode === "spaces") {
        if (navigate)
            navigate({
                to: "/feed",
                replace: true,
            });
    }

    if (!app.mode && app.account) {
        const preferredMode = app.settings?.preferredMode;
        if (navigate)
            navigate({
                to: preferredMode === "feed" ? "/feed" : "/spaces",
                replace: true,
            });
    }
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
