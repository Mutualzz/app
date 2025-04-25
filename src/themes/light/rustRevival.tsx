import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

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
        background: "#EAE7E3",
        surface: "#F9F9F9",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#607D8B",
    },
};
