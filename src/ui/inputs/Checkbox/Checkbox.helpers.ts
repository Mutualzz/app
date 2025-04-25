import { css } from "@emotion/react";
import { isThemeColor } from "@mutualzz/ui/utils/isThemeColor";

import type { Theme } from "@mutualzz/ui/types";
import { alpha } from "@mutualzz/ui/utils/alpha";
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

    return {
        solid: {
            backgroundColor: resolvedColor,
            color: colors.common.white,
            border: "none",
            "&:hover": { backgroundColor: alpha(parsedColor, 0.5) },
            "&:active": { backgroundColor: resolvedColor },
        },
        outlined: {
            backgroundColor: "transparent",
            color: resolvedColor,
            border: `1px solid ${alpha(parsedColor, 0.5)}`,
            "&:hover": {
                backgroundColor: alpha(parsedColor, 0.3),
                border: `1px solid ${alpha(parsedColor, 0.3)}`,
            },
            "&:active": {
                backgroundColor: alpha(parsedColor, 0.15),
            },
        },
        soft: {
            backgroundColor: alpha(parsedColor, checked ? 0.4 : 0.2),
            color: resolvedColor,
            border: "none",
            "&:hover": {
                backgroundColor: alpha(parsedColor, 0.3), // Stronger on hover
            },
            "&:active": {
                backgroundColor: alpha(parsedColor, 0.3), // Even stronger on active
            },
        },
        plain: {
            backgroundColor: "transparent",
            color: resolvedColor,
            border: "none",
            "&:hover": {
                backgroundColor: alpha(parsedColor, 0.5),
            },
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
