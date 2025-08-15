import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const roseRequiemTheme: Theme = {
    ...baseLightTheme,
    id: "roseRequiem",
    name: "Rose Requiem",
    description: "Romantic & Soft Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A23A4F",
        neutral: "#A88A9A", // lighter, romantic mauve
        background: "#F6F4F6", // muted rose-gray
        surface: "#EDE6EC", // distinct, slightly pinkish
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222", // harmonized
            secondary: "#333333",
            accent: "#A23A4F", // match primary
            muted: "#A88A9A", // harmonized, matches neutral
        },
    },
};
