import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    id: "crimsonLament",
    name: "Crimson Lament",
    description: "Dark romantic crimson tones with somber undertones.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#D94A5A",
        neutral: "#B89CA9",
        background: "#181014",
        surface: "#2C1620",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#F47B94",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#E8B7C1",
            accent: "#D94A5A",
            muted: "#A88B97",
        },
    },
};
