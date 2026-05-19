import type { Theme } from "@emotion/react";
import { getIconType, isElectron } from ".";
import { getIconFromCache, putIconInCache } from "@storages/indexedDb";

const canvasToBlob = (
    canvas: HTMLCanvasElement,
    mime = "image/webp",
    quality = 0.9
) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) =>
                b
                    ? resolve(b)
                    : reject(new Error("canvas.toBlob() returned null")),
            mime,
            quality
        );
    });

const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

export const getAdaptiveIcon = async (
    theme: Theme,
    mime = "image/webp",
    iconUrl?: string
): Promise<string> => {
    // If no explicit iconUrl provided, derive one
    if (!iconUrl) {
        if (isElectron) {
            const isBase = theme.id === "baseDark" || theme.id === "baseLight";
            const relPath = isBase
                ? "icons/base/icon.png"
                : "icons/adaptive/icon-adaptive.png";

            const electronDataUrl = await window.api.theme.readIcon(relPath);

            if (!electronDataUrl)
                throw new Error(`Failed to read Electron icon: ${relPath}`);

            iconUrl = electronDataUrl;
        } else iconUrl = getIconType(theme);
    }

    const cacheKey = `${theme.id}-${theme.type}-${theme.colors.primary}-${mime}`;

    const cachedBlob = await getIconFromCache(cacheKey);
    if (cachedBlob) return await blobToDataUrl(cachedBlob);

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
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = theme.colors.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(imageBitmap, 0, 0);

    const blob = await canvasToBlob(canvas, mime, 0.9);
    await putIconInCache(cacheKey, blob);

    return await blobToDataUrl(blob);
};
