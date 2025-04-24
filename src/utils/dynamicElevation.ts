import type { ColorLike } from "@types";
import type { PaperElevation } from "@ui/surfaces/Paper/Paper.types";
import { formatHex8, oklch, parse } from "culori";

export const dynamicElevation = (
    color: ColorLike,
    elevation: PaperElevation,
) => {
    const parsedColor = parse(color);
    if (!parsedColor) return color;

    const oklchColor = oklch(parsedColor);

    const increment = 0.02;

    const newLightness = Math.min(oklchColor.l + elevation * increment, 1);

    const adjustedColor = { ...oklchColor, l: newLightness };

    return formatHex8(adjustedColor);
};
