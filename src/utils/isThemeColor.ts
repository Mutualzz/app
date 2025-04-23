import type { ThemeColor } from "@mutualzz/theme";

export const isThemeColor = (color: unknown): color is ThemeColor => {
    return (
        typeof color === "string" &&
        ["primary", "neutral", "success", "danger", "warning", "info"].includes(
            color,
        )
    );
};
