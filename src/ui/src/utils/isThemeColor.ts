import type { ThemeColor } from "@mutualzz/ui/types";

export const isThemeColor = (color: unknown): color is ThemeColor => {
    return (
        typeof color === "string" &&
        ["primary", "neutral", "success", "danger", "warning", "info"].includes(
            color,
        )
    );
};
