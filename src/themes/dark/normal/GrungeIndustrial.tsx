import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grungeIndustrial",
    name: "Grunge & Industrial",
    description:
        "Grunge industrial palette inspired by 90s underground scenes.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#FF9B5A",
        neutral: "#B8A47A",
        background: "#18140F",
        surface: "#2C2114",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#FFB37A",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#D8C6B0",
            accent: "#FF9B5A",
            muted: "#A88B67",
        },
    },
};
