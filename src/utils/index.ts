import type { Theme as MzTheme } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import type { Theme } from "@stores/objects/Theme";
import { useNavigate } from "@tanstack/react-router";
import { Image as TauriImage } from "@tauri-apps/api/image";
import mergeWith from "lodash-es/mergeWith";
import { isValidElement, type ReactNode } from "react";
import { getIconFromCache, putIconInCache } from "./indexedDb";

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

export const getIconType = (theme: MzTheme): string => {
    let iconUrl = "/icon.png";

    switch (theme.id) {
        case "baseDark":
            iconUrl = "/icon.png";

            break;
        case "baseLight":
            iconUrl = "/icon-light.png";

            break;
        default:
            iconUrl =
                theme.type === "dark"
                    ? "/icon-adaptive.png"
                    : "/icon-light-adaptive.png";

            break;
    }

    return iconUrl;
};

export const getAdaptiveIcon = async (
    theme: MzTheme,
    type: "automatic" | "baseUrl" = "automatic",
    iconUrl?: string,
) => {
    if (!iconUrl) iconUrl = getIconType(theme);

    const cacheKey = `${theme.id}-${theme.type}-${theme.colors.primary}`;

    const cachedIcon = await getIconFromCache(cacheKey);
    if (cachedIcon) {
        // If we need automatic and it's Tauri, convert cached base64 to TauriImage
        if (type === "automatic" && isTauri && typeof cachedIcon === "string") {
            const bytes = Uint8Array.from(atob(cachedIcon.split(",")[1]), (c) =>
                c.charCodeAt(0),
            );
            return await TauriImage.fromBytes(bytes.buffer);
        }
        return cachedIcon;
    }

    const res = await fetch(iconUrl);
    const bytes = await res.arrayBuffer();
    const imageBitmap = await createImageBitmap(new Blob([bytes]));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    if (!ctx) throw new Error("Failed to create canvas context");

    ctx.beginPath();
    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2,
    );
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = theme.colors.primary;
    console.log(theme.colors.primary);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(imageBitmap, 0, 0);

    const base64Data = canvas.toDataURL();
    await putIconInCache(cacheKey, base64Data);

    if (type === "baseUrl") return base64Data;

    if (isTauri) {
        const arrayBuffer = await canvasToArrayBuffer(canvas);
        return await TauriImage.fromBytes(arrayBuffer);
    }

    return base64Data;
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

export const switchMode = (navigate?: ReturnType<typeof useNavigate>) => {
    const app = useAppStore();
    const { mode, account } = app;

    if (mode === "feed") {
        app.setMode("spaces");
        if (navigate)
            navigate({
                to: "/spaces",
                replace: true,
            });
    }

    if (mode === "spaces") {
        app.setMode("feed");
        if (navigate)
            navigate({
                to: "/feed",
                replace: true,
            });
    }

    if (!mode && account) {
        const preferredMode = account.settings.preferredMode;
        app.setMode(preferredMode);
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
