import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const phantomGraceTheme: Theme = {
    ...baseLightTheme,
    id: "phantomGrace",
    name: "Phantom Grace",
    description: "Eerie & Ethereal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#7CA8A6", // muted teal
        neutral: "#A8C0C0", // lighter, ethereal teal-gray
        background: "#F4F7F6", // muted teal-gray
        surface: "#E6EEEC", // distinct, slightly teal
        danger: "#B85C5C", // softer red
        warning: "#E6C463", // softer yellow
        success: "#5CA88A", // softer green
        info: "#5C7FA8", // softer blue
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222", // harmonized
            secondary: "#333333",
            accent: "#6A6A8A", // match primary
            muted: "#3A3A4A", // harmonized
        },
    },
};
