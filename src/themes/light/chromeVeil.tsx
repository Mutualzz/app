import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

export const chromeVeilTheme: Theme = {
    ...baseLightTheme,
    id: "chromeVeil",
    name: "Chrome Veil",
    description: "Industrial Soft Metal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#448E81",
        neutral: "#6B4F59",
        background: "#EAEEED",
        surface: "#F5F7F6",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5AB1A1",
    },
};
