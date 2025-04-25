import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const roseRequiemTheme: Theme = {
    ...baseLightTheme,
    id: "roseRequiem",
    name: "Rose Requiem",
    description: "Romantic & Soft Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#B72C3F",
        neutral: "#7B5A65",
        background: "#F7F3F3",
        surface: "#FFFFFF",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5A84B1",
    },
};
