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
            black: "#12121212122",
        },

        primary: "#6B1E28",
        neutral: "#5A3D4E",
        background: "#090606",
        surface: "#1A0E10",

        danger: "#B52B3F",
        warning: "#D98E04",
        info: "#4A90E2",
        success: "#4CAF50",

        typography: {
            primary: "#E0D2D2",
            neutral: "#8B7B7B",
            accent: "#B52B3F",
        },
    },
};
