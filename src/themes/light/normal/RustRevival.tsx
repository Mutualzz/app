import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const rustRevivalTheme: Theme = {
    ...baseLightTheme,
    id: "rustRevival",
    name: "Rust Revival",
    description: "Warm industrial rust tones with an aged metal feel.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#FF9B5A",
        neutral: "#B8A47A",
        background: "#FBF7F5",
        surface: "#F5EEE9",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#FFB37A",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#8A5F36",
            muted: "#5A5A5F",
        },
    },
};
