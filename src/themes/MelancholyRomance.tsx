import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholy-romance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#F2EAEA",
            black: "#121212",
        },

        primary: "#C84B3C",
        neutral: "#73678F",
        background: "#0A0608",
        surface: "#171117",

        danger: "#9C1123",
        warning: "#B07A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#E3E3E3",
            neutral: "#A79D9C",
            accent: "#7D1128",
        },
    },
};
