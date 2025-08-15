import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const cemeteryDawnTheme: Theme = {
    ...baseLightTheme,
    id: "cemeteryDawn",
    name: "Cemetery Dawn",
    description: "Muted Morning Mist",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#7A5A5A",
        neutral: "#8A7A7A", // lighter, misty neutral
        background: "#F6F6F7", // more muted, layered gray
        surface: "#E6E6EA", // cooler, more distinct from background
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
            accent: "#7A5A5A", // match primary
            muted: "#4A3A3A", // harmonized
        },
    },
};
