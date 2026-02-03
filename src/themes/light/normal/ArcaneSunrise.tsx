import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const arcaneSunriseTheme: Theme = {
    ...baseLightTheme,
    id: "arcaneSunrise",
    name: "Arcane Sunrise",
    description: "Warm mystical morning glow with soft green highlights.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#4DBE9A",
        neutral: "#7CA88A",
        background: "#F5F9F6",
        surface: "#E9F4EA",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#A7E1C9",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#3A7C6A",
            muted: "#5A5A5F",
        },
    },
};
