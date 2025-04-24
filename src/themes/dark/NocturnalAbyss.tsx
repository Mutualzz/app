import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnalAbyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        common: {
            white: "#E8E0E0",
            black: "#121212",
        },

        primary: "#476680",
        neutral: "#6A4F68",
        background: "#090909",
        surface: "#131313",

        danger: "#C3073F",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E0D6D6",
            neutral: "#8C8294",
            accent: "#5A7595",
        },
    },
};
