import { type Theme } from "@emotion/react";
import { isThemeColor } from "@utils";
import Color from "color";
import type {
    CircularProgressColor,
    CircularProgressDefaultsInterface,
    CircularProgressSize,
    CircularProgressVariant,
} from "./CircularProgress.types";

const minSize = 16,
    maxSize = 64;
const defaultSize: CircularProgressSize = "md";
const defaultColor: CircularProgressColor = "primary";
const defaultVariant: CircularProgressVariant = "soft";
const defaultDeterminate = false;
const defaultValue = 0;

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

export const sizes: Record<CircularProgressSize, number> = {
    sm: 24,
    md: 36,
    lg: 48,
};

export const thicknesses = (size: CircularProgressSize) =>
    ({
        sm: 4,
        md: 6,
        lg: 8,
    })[size];
