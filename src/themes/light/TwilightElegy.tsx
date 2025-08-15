import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const twilightElegyTheme: Theme = {
    ...baseLightTheme,
    id: "twilightElegy",
    name: "Twilight Elegy",
    description: "Gothic Violet Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#6A7CA8", // muted blue
        neutral: "#A8A8C0", // lighter, soft lavender-gray
        background: "#F4F5F8", // muted blue-gray
        surface: "#E6E8EE", // distinct, slightly blue
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
            accent: "#6A4A8A", // match primary
            muted: "#3A3A5A", // harmonized
        },
    },
};
