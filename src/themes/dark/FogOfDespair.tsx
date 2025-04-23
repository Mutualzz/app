import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fog-of-despair",
    name: "Fog of Despair",
    description: "Cold, Distant, and Ethereal",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#E6EBF0",
            black: "#131619",
        },

        primary: "#496D89",
        neutral: "#7D8F99",
        background: "#0B0D10",
        surface: "#171C24",

        danger: "#BA4CFF",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E3E8EC",
            neutral: "#A2A9B1",
            accent: "#BA4CFF",
        },
    },
};
