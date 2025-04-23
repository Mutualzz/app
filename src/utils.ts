import type { Hex, ThemeColor } from "@mutualzz/theme";
import type { PaperElevation } from "@ui/surfaces/Paper/Paper.types";
import {
    formatHex8,
    oklch,
    parse,
    rgb,
    wcagContrast,
    type Color,
    type Rgb,
} from "culori";

export const dynamicElevation = (color: Hex, elevation: PaperElevation) => {
    const parsedColor = parse(color);
    if (!parsedColor) return color;

    const oklchColor = oklch(parsedColor);

    const increment = 0.02;

    const newLightness = Math.min(oklchColor.l + elevation * increment, 1);

    const adjustedColor = { ...oklchColor, l: newLightness };

    return formatHex8(adjustedColor);
};

export const isThemeColor = (color: unknown): color is ThemeColor => {
    return (
        typeof color === "string" &&
        ["primary", "neutral", "success", "danger", "warning", "info"].includes(
            color,
        )
    );
};

export const invertColor = (color: Rgb, alphaScale: number = 1): Rgb => ({
    mode: "rgb",
    r: 1 - color.r,
    g: 1 - color.g,
    b: 1 - color.b,
    alpha: Math.min(Math.max((color.alpha ?? 1) * alphaScale, 0), 1),
});

export const getReadableTextColor = (
    background: string,
    fallbackText: string,
    minContrast: number = 4.5,
): string => {
    const bgParsed = parse(background);
    const textParsed = parse(fallbackText);

    if (!bgParsed || !textParsed) throw new Error("Invalid color");

    const bgRgb = rgb(bgParsed);
    const textRgb = rgb(textParsed);

    const contrast = wcagContrast(bgRgb, textRgb);

    return contrast >= minContrast
        ? formatHex8(textParsed)
        : formatHex8(invertColor(textRgb));
};

export const alpha = (base: Color, value: number) =>
    formatHex8({ ...base, alpha: value });
