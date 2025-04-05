import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grunge-industrial",
    name: "Grunde & Industrial",
    description: "90s Underground Aesthetic",
    colors: {
        primary: "#383E42",
        secondary: "#5E3549",
        background: "#101010",
        surface: "#1E1E1E",
        typography: {
            primary: "#DFDFDF",
            secondary: "#9E9E9E",
            accent: "#6B5B4C",
        },
    },
};
