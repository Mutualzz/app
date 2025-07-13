import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    id: "crimsonLament",
    name: "Crimson Lament",
    description: "Dark Romance & Tragedy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#8B1F2C",
        neutral: "#6B4352",
        background: "#090606",
        surface: "#1C1012",
        danger: "#B03045",
        warning: "#D4A033",
        success: "#57C768",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F0F0F0",
            secondary: "#C8A5A5",
            accent: "#B84D58",
            disabled: "#6B4352",
        },
    },
};
