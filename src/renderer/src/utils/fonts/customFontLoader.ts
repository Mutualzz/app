import { getCustomFontCssFamily, type CustomFontExt } from "@mutualzz/ui-core";
import { CDNRoutes } from "@mutualzz/types";
import { REST } from "@stores/REST.store";

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

const FONT_FORMATS: Record<CustomFontExt, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
};

function styleId(userId: string, hash: string) {
  return `custom-font-${userId}-${hash.slice(0, 16)}`;
}

export async function ensureCustomFont(
  userId: string,
  hash: string,
  ext: CustomFontExt = "woff2",
) {
  const key = `${userId}:${hash}`;
  if (loaded.has(key)) return;

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const request = new Promise<void>((resolve, reject) => {
    const id = styleId(userId, hash);
    if (document.getElementById(id)) {
      loaded.add(key);
      resolve();
      return;
    }

    const cssFamily = getCustomFontCssFamily(hash);
    const url = REST.makeCDNUrl(CDNRoutes.profileFont(userId, hash, ext));
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
@font-face {
  font-family: '${cssFamily}';
  src: url('${url}') format('${FONT_FORMATS[ext]}');
  font-display: swap;
}
`;

    style.onload = () => {
      loaded.add(key);
      resolve();
    };
    style.onerror = () => reject(new Error(`Failed to load custom font: ${hash}`));

    document.head.appendChild(style);

    // style elements don't always fire onload for @font-face; resolve next frame.
    requestAnimationFrame(() => {
      loaded.add(key);
      resolve();
    });
  })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, request);
  return request;
}
