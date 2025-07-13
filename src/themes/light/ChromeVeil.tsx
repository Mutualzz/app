import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const chromeVeilTheme: Theme = {
    ...baseLightTheme,
    id: "chromeVeil",
    name: "Chrome Veil",
    description: "Industrial Soft Metal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#448E81",
        neutral: "#6B4F59",
        background: "#EAEEED",
        surface: "#F5F7F6",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#448E81",
            disabled: "#7E8A8A",
        },
    },
};
