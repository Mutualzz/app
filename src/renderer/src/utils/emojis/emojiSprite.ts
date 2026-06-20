import emojiDataSource from "emoji-datasource-twitter/emoji.json";
import { CSSProperties } from "react";

export const SKIN_TONE_MODIFIERS = [
  "1F3FB", // light
  "1F3FC", // medium-light
  "1F3FD", // medium
  "1F3FE", // medium-dark
  "1F3FF" // dark
] as const;

export type SkinTone = (typeof SKIN_TONE_MODIFIERS)[number] | null;

const SHEET_URL = "https://proxy.mutualzz.com/assets/content/sheets/32.png";
const SHEET_COLS = 62;
const SHEET_CELL_SIZE = 32;

const sheetMap = new Map(
  emojiDataSource.map((e) => [e.unified.toUpperCase(), e])
);

export interface SpriteCoords {
  sheetX: number;
  sheetY: number;
}

export function getSpriteCoords(hexcode: string, skinTone: SkinTone = null) {
  const unified = hexcode.toUpperCase();
  const entry = sheetMap.get(unified);
  if (!entry) return null;

  if (skinTone && entry.skin_variations?.[skinTone]) {
    const variant = entry.skin_variations[skinTone];
    return { sheetX: variant.sheet_x, sheetY: variant.sheet_y };
  }

  return { sheetX: entry.sheet_x, sheetY: entry.sheet_y };
}

export function emojiValueToUnified(value: string) {
  const parts: string[] = [];

  for (let index = 0; index < value.length; ) {
    const codePoint = value.codePointAt(index)!;
    parts.push(codePoint.toString(16).toUpperCase());
    index += codePoint > 0xffff ? 2 : 1;
  }

  return parts.join("-");
}

export function getSpriteCoordsForEmojiValue(value: string): SpriteCoords | null {
  const unified = emojiValueToUnified(value);

  let coords = getSpriteCoords(unified);
  if (coords) return coords;

  if (unified.includes("-FE0F")) {
    coords = getSpriteCoords(unified.replace(/-FE0F/g, ""));
    if (coords) return coords;
  }

  const segments = unified.split("-");
  const skinTone = segments.at(-1);

  if (skinTone && /^1F3F[B-F]$/.test(skinTone) && segments.length > 1) {
    coords = getSpriteCoords(
      segments.slice(0, -1).join("-"),
      skinTone as SkinTone
    );
    if (coords) return coords;
  }

  return null;
}

export function getSpriteStyle(
  sheetX: number,
  sheetY: number,
  renderSize: number = 32
): CSSProperties {
  const scale = renderSize / SHEET_CELL_SIZE;
  const sheetRenderSize = SHEET_COLS * SHEET_CELL_SIZE * scale;

  return {
    display: "inline-block",
    width: renderSize,
    height: renderSize,
    backgroundImage: `url(${SHEET_URL})`,
    backgroundSize: `${sheetRenderSize}px ${sheetRenderSize}px`,
    backgroundPosition: `-${sheetX * renderSize}px -${sheetY * renderSize}px`,
    backgroundRepeat: "no-repeat"
  };
}
