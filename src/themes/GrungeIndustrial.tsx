import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grunge-industrial",
    name: "Grunde & Industrial",
    description: "90s Underground Aesthetic",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#383E42",
        secondary: "#5E3549",
        background: "#101010",
        surface: "#1E1E1E",

        error: "#A54242",
        warning: "#C49A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#DFDFDF",
            secondary: "#9E9E9E",
            accent: "#6B5B4C",
        },
    },
};
