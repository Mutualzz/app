import { type Theme } from "@emotion/react";
import { isThemeColor } from "@utils/index";
import { formatHex8, parse } from "culori";
import type {
    CircularProgressColor,
    CircularProgressDefaultsInterface,
    CircularProgressSize,
    CircularProgressThickness,
    CircularProgressVariant,
} from "./CircularProgress.types";

const minSize = 16,
    maxSize = 64;
const defaultSize: CircularProgressSize = "md";
const defaultColor: CircularProgressColor = "primary";
const defaultVariant: CircularProgressVariant = "soft";
const defaultDeterminate = false;
const defaultValue = 0;

const minSizeThickness = 2,
    maxSizeThickness = 10;

export const CircularProgressDefaults: CircularProgressDefaultsInterface = {
    minSize,
    maxSize,
    defaultSize,
    defaultColor,
    defaultVariant,
    defaultDeterminate,
    defaultValue,
};

export const variantColors = (
    { colors }: Theme,
    color: CircularProgressColor,
) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = isCustomColor ? color : colors[color];

    const parsedColor = parse(resolvedColor);

    if (!parsedColor)
        return {
            plain: "transparent",
            solid: "transparent",
            soft: "transparent",
            outlined: "transparent",
        };

    const solid = { ...parsedColor, alpha: 0.4 };
    const soft = { ...parsedColor, alpha: 0.2 };

    return {
        plain: "transparent",
        solid: formatHex8(solid),
        soft: formatHex8(soft),
        outlined: "transparent",
    };
};

export const sizes: Record<CircularProgressSize, number> = {
    sm: 24,
    md: 36,
    lg: 48,
};

export const thicknesses: Record<CircularProgressThickness, number> = {
    sm: 4,
    md: 6,
    lg: 8,
};

export const resolveCircularProgressSizes = (size: CircularProgressSize) => {
    let base = sizes[size] ?? size;

    if (base < minSize) base = minSize;
    if (base > maxSize) base = maxSize;

    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = sizes.md;

    return base;
};

export const resolveCiruclarProgressThickness = (
    thickness: CircularProgressThickness,
) => {
    let base = thicknesses[thickness] ?? thickness;

    if (base < minSizeThickness) base = minSizeThickness;
    if (base > maxSizeThickness) base = maxSizeThickness;

    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = thicknesses.md;

    return base;
};
