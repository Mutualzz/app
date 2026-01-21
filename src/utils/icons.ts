import type { Theme } from "@emotion/react";
import { Image as TauriImage } from "@tauri-apps/api/image";
import { getIconType, isTauri } from ".";
import { getIconFromCache, putIconInCache } from "./indexedDb";

const canvasToBlob = (
    canvas: HTMLCanvasElement,
    mime = "image/webp",
    quality = 0.9,
) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) =>
                b
                    ? resolve(b)
                    : reject(new Error("canvas.toBlob() returned null")),
            mime,
            quality,
        );
    });

const blobToArrayBuffer = (blob: Blob) => blob.arrayBuffer();

type AdaptiveIconReturn<T extends "automatic" | "baseUrl"> =
    T extends "automatic" ? string | TauriImage : string;

export const getAdaptiveIcon = async <T extends "automatic" | "baseUrl">(
    theme: Theme,
    type: T = "automatic" as T,
    mime = "image/webp",
    iconUrl?: string,
): Promise<AdaptiveIconReturn<T>> => {
    if (!iconUrl) iconUrl = getIconType(theme);

    const cacheKey = `${theme.id}-${theme.type}-${theme.colors.primary}-${mime}`;

    const cachedBlob = await getIconFromCache(cacheKey);
    if (cachedBlob) {
        if (type === "baseUrl")
            return URL.createObjectURL(cachedBlob) as AdaptiveIconReturn<T>;

        if (isTauri) {
            const ab = await blobToArrayBuffer(cachedBlob);
            return (await TauriImage.fromBytes(ab)) as AdaptiveIconReturn<T>;
        }

        return URL.createObjectURL(cachedBlob) as AdaptiveIconReturn<T>;
    }

    const res = await fetch(iconUrl);
    if (!res.ok) throw new Error("Failed to fetch icon");

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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(imageBitmap, 0, 0);

    const blob = await canvasToBlob(canvas, mime, 0.9);
    await putIconInCache(cacheKey, blob);

    if (type === "baseUrl") {
        return URL.createObjectURL(blob) as AdaptiveIconReturn<T>;
    }

    if (isTauri) {
        const ab = await blobToArrayBuffer(blob);
        return (await TauriImage.fromBytes(ab)) as AdaptiveIconReturn<T>;
    }

    return URL.createObjectURL(blob) as AdaptiveIconReturn<T>;
};
