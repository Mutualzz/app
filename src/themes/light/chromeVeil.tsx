import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const chromeVeilTheme: Theme = {
    ...baseLightTheme,
    id: "chromeVeil",
    name: "Chrome Veil",
    description: "Industrial Soft Metal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#5AB1A1",
        neutral: "#6B4F59",
        background: "#F3F6F5",
        surface: "#FFFFFF",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5AB1A1",
    },
};
