import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witching-hour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#F0E8F0",
            black: "#121212",
        },

        primary: "#9C4D73",
        neutral: "#2A4B76",
        background: "#0A0A12",
        surface: "#151526",

        danger: "#AD1457",
        warning: "#D4A017",
        info: "#3896D0",
        success: "#4CAF50",

        typography: {
            primary: "#EAE5E5",
            neutral: "#8C7C96",
            accent: "#AD60A1",
        },
    },
};
