import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const arcaneSunriseTheme: Theme = {
    ...baseLightTheme,
    id: "arcaneSunrise",
    name: "Arcane Sunrise",
    description: "Mystical Morning Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#4DA380",
        neutral: "#2A4B76",
        background: "#E4ECE9",
        surface: "#F4F7F6",
        danger: "#AD1457",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#4DA380",
            disabled: "#7D8F99",
        },
    },
};
