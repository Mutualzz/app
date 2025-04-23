import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    id: "crimson-lament",
    name: "Crimson Lament",
    description: "Dark Romance & Tragedy",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#F0E8E8",
            black: "#121212",
        },

        primary: "#8E2C3B",
        neutral: "#5A3D4E",
        background: "#090606",
        surface: "#1A0E10",

        danger: "#B52B3F",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E0D2D2",
            neutral: "#8B7B7B",
            accent: "#C85668",
        },
    },
};
