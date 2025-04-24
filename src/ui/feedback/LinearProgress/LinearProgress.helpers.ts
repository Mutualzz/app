import type { Theme } from "@emotion/react";
import { isThemeColor } from "@utils/index";

import { formatHex8, parse } from "culori";
import type {
    LinearProgressColor,
    LinearProgressLength,
    LinearProgressThickness,
} from "./LinearProgress.types";

const minLength = 80,
    maxLength = 240;
const minThickness = 4,
    maxThickness = 16;

export const variantColors = (
    { colors }: Theme,
    color: LinearProgressColor,
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
    const soft = { ...parsedColor, alpha: 0.1 };

    return {
        plain: "transparent",
        solid: formatHex8(solid),
        soft: formatHex8(soft),
        outlined: "transparent",
    };
};

export const thicknessMap: Record<LinearProgressThickness, number> = {
    sm: 4,
    md: 6,
    lg: 8,
};

export const lengthMap: Record<LinearProgressThickness, number> = {
    sm: 120,
    md: 160,
    lg: 200,
};

export const resolveThickness = (
    thickness: LinearProgressThickness,
): string | number => {
    if (thickness in thicknessMap && typeof thickness === "string")
        return thicknessMap[thickness];

    let base = thicknessMap[thickness] ?? thickness;
    if (base < minThickness) base = minThickness;
    if (base > maxThickness) base = maxThickness;
    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = thicknessMap.md;

    return base;
};

export const resolveLength = (
    length: LinearProgressLength,
): string | number => {
    if (length in lengthMap && typeof length === "string")
        return lengthMap[length];

    let base = lengthMap[length] ?? length;

    if (base < minLength) base = minLength;
    if (base > maxLength) base = maxLength;

    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = lengthMap.md;

    return base;
};
