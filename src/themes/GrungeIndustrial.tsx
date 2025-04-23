import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grunge-industrial",
    name: "Grunde & Industrial",
    description: "90s Underground Aesthetic",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#E8E8E8",
            black: "#151515",
        },

        primary: "#56606A",
        neutral: "#7E4050",
        background: "#101010",
        surface: "#1E1E1E",

        danger: "#A54242",
        warning: "#C49A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#DFDFDF",
            neutral: "#9E9E9E",
            accent: "#6B5B4C",
        },
    },
};
