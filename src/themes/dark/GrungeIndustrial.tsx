import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grungeIndustrial",
    name: "Grunde & Industrial",
    description: "90s Underground Aesthetic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        common: {
            white: "#E8E8E8",
            black: "#151515",
        },

        primary: "#5C5C5E",
        neutral: "#7E4050",
        background: "#101010",
        surface: "#1E1E1E",

        danger: "#A54242",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#DFDFDF",
            neutral: "#9E9E9E",
            accent: "#C85668",
        },
    },
};
