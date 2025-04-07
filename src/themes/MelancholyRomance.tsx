import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholy-romance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5A1E1E",
        secondary: "#413C58",
        background: "#0A0608",
        surface: "#171117",

        error: "#7D1128",
        warning: "#B07A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#E3E3E3",
            secondary: "#A79D9C",
            accent: "#7D1128",
        },
    },
};
