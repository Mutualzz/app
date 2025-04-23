import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyard-whispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#E0E0E0",
            black: "#121212",
        },

        primary: "#5A5A5A",
        neutral: "#7B4B53",
        background: "#0D0D0D",
        surface: "#1A1A1A",

        danger: "#8F3A42",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#D1D1D1",
            neutral: "#939393",
            accent: "#9C5050",
        },
    },
};
