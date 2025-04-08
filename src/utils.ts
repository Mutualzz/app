import type { ColorInstance } from "color";
import type { HexString } from "./emotion";
import type { PaperElevation } from "./ui/Paper/Paper.types";

export const dynamicElevation = (
    color: ColorInstance,
    elevation: PaperElevation,
) => {
    const baseLightness = color.lightness();
    const increment = 4;

    const newLightness = Math.min(baseLightness + elevation * increment, 100);

    return color.lightness(newLightness).toString() as HexString;
};
