import type { Theme } from "@emotion/react";
import { isThemeColor } from "@utils";
import Color from "color";
import type {
    LinearProgressAnimation,
    LinearProgressColor,
    LinearProgressDefaultsInterface,
    LinearProgressLength,
    LinearProgressThickness,
    LinearProgressVariant,
} from "./LinearProgress.types";

const minLength = 80,
    maxLength = 240;
const minThickness = 4,
    maxThickness = 16;
const defaultLength: LinearProgressLength = "md",
    defaultThickness: LinearProgressThickness = "md";
const defaultColor: LinearProgressColor = "primary";
const defaultVariant: LinearProgressVariant = "soft";
const defaultAnimation: LinearProgressAnimation = "bounce";
const defaultDeterminate = false;
const defaultValue = 0;

export const LinearProgressDefaults: LinearProgressDefaultsInterface = {
    minLength,
    maxLength,
    minThickness,
    maxThickness,
    defaultLength,
    defaultThickness,
    defaultColor,
    defaultVariant,
    defaultAnimation,
    defaultDeterminate,
    defaultValue,
};

export const variantColors = (
    { colors }: Theme,
    color: LinearProgressColor,
) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = isCustomColor ? Color(color).hexa() : colors[color];

    return {
        plain: "transparent",
        solid: Color(resolvedColor).alpha(0.4).hexa(),
        soft: Color(resolvedColor).alpha(0.1).hexa(),
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

    const num = Number(thickness);
    if (num < minThickness) return minThickness;
    if (num > maxThickness) return maxThickness;

    return num;
};

export const resolveLength = (
    length: LinearProgressLength,
): string | number => {
    if (length in lengthMap && typeof length === "string")
        return lengthMap[length];

    const num = Number(length);
    if (num < minLength) return minLength;
    if (num > maxLength) return maxLength;

    return num;
};
