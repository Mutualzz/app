import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

export const rustRevivalTheme: Theme = {
    ...baseLightTheme,
    id: "rustRevival",
    name: "Rust Revival",
    description: "Industrial Warm Rust",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#81472F",
        neutral: "#7E4050",
        background: "#ECE8E5",
        surface: "#F6F4F2",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#607D8B",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#81472F",
        },
    },
};
