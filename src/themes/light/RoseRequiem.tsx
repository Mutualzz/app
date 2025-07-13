import type { Theme } from "@mutualzz/ui";
import { baseLightTheme } from "@mutualzz/ui";

export const roseRequiemTheme: Theme = {
    ...baseLightTheme,
    id: "roseRequiem",
    name: "Rose Requiem",
    description: "Romantic & Soft Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#9C2232",
        neutral: "#7B5A65",
        background: "#F2EEEE",
        surface: "#F8F5F5",
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
            accent: "#9C2232",
            disabled: "#8A6A72",
        },
    },
};
