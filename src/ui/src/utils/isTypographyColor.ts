import type { TypographyColor } from "@mutualzz/ui/types";

export const isTypographyColor = (color: unknown): color is TypographyColor => {
    return (
        typeof color === "string" &&
        ["primary", "neutral", "accent"].includes(color)
    );
};
