import { css, type Theme } from "@emotion/react";
import { isThemeColor } from "@utils/isThemeColor";

import { alpha } from "@utils/alpha";
import { parse } from "culori";
import type { CheckboxColor, CheckboxSize } from "./Checkbox.types";

const minSize = 16,
    maxSize = 40;

export const baseSizeMap: Record<CheckboxSize, number> = {
    sm: 22,
    md: 28,
    lg: 32,
};

export const resolveCheckboxStyles = (size: CheckboxSize) => {
    let base = baseSizeMap[size] ?? size;

    if (base < minSize) base = minSize;
    if (base > maxSize) base = maxSize;
    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = baseSizeMap.md;

    return css({
        padding: base * 0.2,
        lineHeight: 0,
        fontSize: base * 0.6,
    });
};

export const variantColors = (
    { colors }: Theme,
    color: CheckboxColor,
    checked?: boolean,
) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = isCustomColor ? color : colors[color];

    const parsedColor = parse(resolvedColor);
    if (!parsedColor) throw new Error("Invalid color");

    const softBg = alpha(parsedColor, checked ? 0.25 : 0.1);

    return {
        solid: {
            backgroundColor: resolvedColor,
            color: colors.typography.primary,
            border: "none",
            "&:hover": { backgroundColor: resolvedColor },
            "&:active": { backgroundColor: resolvedColor },
        },
        outlined: {
            backgroundColor: "transparent",
            color: resolvedColor,
            border: `1px solid ${resolvedColor}`,
            "&:hover": {
                backgroundColor: alpha(parsedColor, 0.1),
            },
            "&:active": {
                backgroundColor: alpha(parsedColor, 0.15),
                color: colors.typography.primary,
            },
        },
        soft: {
            backgroundColor: softBg,
            color: resolvedColor,
            border: "none",
            "&:hover": {
                backgroundColor: alpha(parsedColor, 0.25), // Stronger on hover
            },
            "&:active": {
                backgroundColor: alpha(parsedColor, 0.3), // Even stronger on active
            },
        },
        plain: {
            backgroundColor: "transparent",
            color: resolvedColor,
            border: "none",
            "&:hover": { color: alpha(parsedColor, 0.8) },
            "&:active": { color: alpha(parsedColor, 0.5) },
        },
    };
};

export const resolveIconScaling = (size: CheckboxSize) => {
    let base = baseSizeMap[size] ?? size;

    if (base < minSize) base = minSize;
    if (base > maxSize) base = maxSize;
    if (typeof base === "string") base = parseFloat(base);
    if (isNaN(base)) base = baseSizeMap.md;

    const scale = base * 0.4;

    return css({
        width: scale,
        height: scale,
    });
};
