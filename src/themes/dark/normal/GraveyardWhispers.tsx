import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyardWhispers",
    name: "Graveyard Whispers",
    description: "Muted eerie palette with cold, spectral tones.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#AEB6CF",
        neutral: "#8C9BAA",
        background: "#181A1F",
        surface: "#23262E",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#7CA7E6",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#C3C9D1",
            accent: "#AEB6CF",
            muted: "#7C8B9C",
        },
    },
};
