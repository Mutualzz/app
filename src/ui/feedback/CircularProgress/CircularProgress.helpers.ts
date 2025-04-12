import { type Theme } from "@emotion/react";
import { isThemeColor } from "@utils";
import Color from "color";
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

    return {
        plain: "transparent",
        solid: Color(resolvedColor).alpha(0.4).hexa(),
        soft: Color(resolvedColor).alpha(0.1).hexa(),
        outlined: "transparent",
    };
};

export const resolveCircularProgressSizes = (size: CircularProgressSize) => {
    let base = sizes[size] ?? size;

    if (base < minSize) base = minSize;
    if (base > maxSize) base = maxSize;

    if (typeof base === "string") base = Number(base);

    return base;
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

export const resolveCiruclarProgressThickness = (
    thickness: CircularProgressThickness,
) => {
    let base = thicknesses[thickness] ?? thickness;

    if (base < minSizeThickness) base = minSizeThickness;
    if (base > maxSizeThickness) base = maxSizeThickness;

    if (typeof base === "string") base = Number(base);

    return base;
};
