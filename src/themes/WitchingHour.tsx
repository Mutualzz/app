import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witching-hour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#3F2841",
        secondary: "#2B2B4F",
        background: "#0A0A12",
        surface: "#151526",

        error: "#AD1457",
        warning: "#D4A017",
        info: "#5A7A8C",
        success: "#4CAF50",

        typography: {
            primary: "#EAE5E5",
            secondary: "#8C7C96",
            accent: "#AD60A1",
        },
    },
};
