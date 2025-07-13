import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const velvetLullabyTheme: Theme = {
    ...baseLightTheme,
    id: "velvetLullaby",
    name: "Velvet Lullaby",
    description: "Vintage & Dramatic",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#98625D",
        neutral: "#73678F",
        background: "#EDE9E8",
        surface: "#F7F5F5",
        danger: "#9C5050",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#98625D",
            disabled: "#7B6A7A",
        },
    },
};
