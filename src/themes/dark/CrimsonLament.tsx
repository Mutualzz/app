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
        primary: "#A23A4F",
        neutral: "#A88A9A", // lighter, romantic mauve
        background: "#18161A", // deep muted burgundy-black
        surface: "#23141A", // muted wine, distinct from background
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4", // softer white
            secondary: "#E0B0B0",
            accent: "#A23A4F", // match primary
            muted: "#A88A9A", // harmonized, matches neutral
        },
    },
};
