import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const midghtEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnightElegance",
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#EEECEC",
            black: "#121212",
        },

        primary: "#59577D",
        neutral: "#5A4A69",
        background: "#0A0A0A",
        surface: "#161616",

        danger: "#783937",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E5E5E5",
            neutral: "#A09EA6",
            accent: "#7157A8",
        },
    },
};
