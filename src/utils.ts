import type { ColorLike, Hex, ThemeColor } from "@mutualzz/theme";
import type { PaperElevation } from "@ui/surfaces/Paper/Paper.types";
import Color from "color";

export const dynamicElevation = (
    color: ColorLike,
    elevation: PaperElevation,
) => {
    const instance = Color(color);

    const baseLightness = instance.lightness();
    const increment = 2;

    const newLightness = Math.min(baseLightness + elevation * increment, 100);

    return instance.lightness(newLightness).hexa() as Hex;
};

export const isThemeColor = (color: unknown): color is ThemeColor => {
    return (
        typeof color === "string" &&
        ["primary", "neutral", "success", "error", "warning", "info"].includes(
            color,
        )
    );
};
