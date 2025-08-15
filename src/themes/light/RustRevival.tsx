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
        primary: "#A87C5A", // softer, less saturated
        neutral: "#A89A7A", // lighter, warm taupe
        background: "#F7F5F3", // muted rust-gray
        surface: "#EDE6E3", // distinct, slightly rust
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
            accent: "#A87C5A", // match primary
            muted: "#5A4A3A", // harmonized
        },
    },
};
