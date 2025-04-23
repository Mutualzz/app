import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witchingHour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#F0E8F0",
            black: "#121212",
        },

        primary: "#6D4B8D",
        neutral: "#2A4B76",
        background: "#0A0A12",
        surface: "#151526",

        danger: "#AD1457",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#EAE5E5",
            neutral: "#8C7C96",
            accent: "#BA4CFF",
        },
    },
};
