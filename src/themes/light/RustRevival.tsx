import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const rustRevivalTheme: Theme = {
    ...baseLightTheme,
    id: "rustRevival",
    name: "Rust Revival",
    description: "Industrial Warm Rust",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#81472F",
        neutral: "#7E4050",
        background: "#ECE8E5",
        surface: "#F6F4F2",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#81472F",
            disabled: "#7E5F50",
        },
    },
};
