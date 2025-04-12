import { css, type Theme } from "@emotion/react";
import { isThemeColor } from "@utils";
import Color from "color";
import type {
    ButtonColor,
    ButtonDefaultsInterface,
    ButtonSize,
    ButtonVariant,
} from "./Button.types";

const minSize = 10,
    maxSize = 24;
const defaultSize: ButtonSize = "md";
const defaultColor: ButtonColor = "primary";
const defaultVariant: ButtonVariant = "plain";

export const ButtonDefaults: ButtonDefaultsInterface = {
    minSize,
    maxSize,
    defaultSize,
    defaultColor,
    defaultVariant,
};

export const baseSizeMap: Record<ButtonSize, number> = {
    sm: 12,
    md: 14,
    lg: 16,
};

export const resolveButtonStyles = (size: ButtonSize) => {
    let base = baseSizeMap[size] ?? size;

    if (base < minSize) base = minSize;
    if (base > maxSize) base = maxSize;

    if (typeof base === "string") base = Number(base);

    return css({
        width: "auto",
        height: `${base + 16}px`,
        fontSize: base,
        lineHeight: 1,
    });
};

export const variantColors = ({ colors }: Theme, color: ButtonColor) => {
    const isCustomColor = !isThemeColor(color);
    const resolvedColor = Color(isCustomColor ? color : colors[color]);

    return {
        solid: {
            backgroundColor: resolvedColor.hexa(),
            color: Color(resolvedColor).isLight()
                ? Color(colors.typography.primary).negate().hexa()
                : colors.typography.primary,
            border: "none",
            "&:hover": {
                backgroundColor: resolvedColor.alpha(0.8).hexa(),
            },
            "&:active": {
                backgroundColor: resolvedColor.alpha(0.6).hexa(),
            },
            "&:disabled": {
                backgroundColor: resolvedColor.alpha(0.2).hexa(),
                color: Color(colors.typography.primary).alpha(0.5).hexa(),
            },
        },
        outlined: {
            backgroundColor: "transparent",
            border: `1px solid ${resolvedColor}`,
            color: resolvedColor.hexa(),
            "&:hover": {
                backgroundColor: resolvedColor.alpha(0.2).hexa(),
                border: `1px solid ${resolvedColor.alpha(0.2).hexa()}`,
            },
            "&:active": {
                backgroundColor: resolvedColor.alpha(0.2).hexa(),
            },
            "&:disabled": {
                color: resolvedColor.alpha(0.5).hexa(),
                border: `1px solid ${resolvedColor.alpha(0.5).hexa()}`,
            },
        },
        plain: {
            backgroundColor: "transparent",
            border: "none",
            color: resolvedColor.hexa(),
            "&:hover": {
                color: resolvedColor.alpha(0.8).hexa(),
            },
            "&:active": {
                color: resolvedColor.alpha(0.5).hexa(),
            },
            "&:disabled": {
                color: resolvedColor.alpha(0.5).hexa(),
            },
        },
        soft: {
            backgroundColor: resolvedColor.alpha(0.5).hexa(),
            color: resolvedColor.hexa(),
            border: "none",
            "&:hover": {
                backgroundColor: resolvedColor.alpha(0.3).hexa(),
            },
            "&:active": {
                backgroundColor: resolvedColor.alpha(0.2).hexa(),
            },
            "&:disabled": {
                backgroundColor: resolvedColor.alpha(0.2).hexa(),
                color: resolvedColor.alpha(0.5).hexa(),
            },
        },
    };
};
