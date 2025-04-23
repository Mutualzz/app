import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const midghtEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnight-elegance",
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#EEECEC",
            black: "#121212",
        },

        primary: "#8C3A46",
        neutral: "#5A4A69",
        background: "#0A0A0A",
        surface: "#161616",

        danger: "#783937",
        warning: "#B07A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#E5E5E5",
            neutral: "#A09EA6",
            accent: "#783937",
        },
    },
};
