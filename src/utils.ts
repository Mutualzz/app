import type { PaperElevation } from "@ui/surfaces/Paper/Paper.types";
import type { ColorInstance } from "color";
import Color from "color";
import type { HexString } from "./emotion";

export const dynamicElevation = (
    color: ColorInstance,
    elevation: PaperElevation,
) => {
    color = Color(color);

    const baseLightness = color.lightness();
    const increment = 2;

    const newLightness = Math.min(baseLightness + elevation * increment, 100);

    return color.lightness(newLightness).hexa() as HexString;
};
