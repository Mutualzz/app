import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fog-of-despair",
    name: "Fog of Despair",
    description: "Cold, Distant, and Ethereal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#4A5A6A",
        neutral: "#7D8F99",
        background: "#0B0D10",
        surface: "#171C24",

        error: "#A33E4C",
        warning: "#C47E29",
        info: "#5C8DB6",
        success: "#4A7F4E",

        typography: {
            primary: "#E3E8EC",
            neutral: "#A2A9B1",
            accent: "#5C677D",
        },
    },
};
