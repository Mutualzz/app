import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

export const roseRequiemTheme: Theme = {
    ...baseLightTheme,
    id: "roseRequiem",
    name: "Rose Requiem",
    description: "Romantic & Soft Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#9C2232",
        neutral: "#7B5A65",
        background: "#F2EEEE",
        surface: "#F9F9F9",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5A84B1",
    },
};
