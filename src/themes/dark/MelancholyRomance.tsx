import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholyRomance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#F2EAEA",
            black: "#121212",
        },

        primary: "#87485F",
        neutral: "#73678F",
        background: "#0A0608",
        surface: "#171117",

        danger: "#9C1123",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E3E3E3",
            neutral: "#A79D9C",
            accent: "#9C5050",
        },
    },
};
