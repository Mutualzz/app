import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternal-mourning",
    name: "Eternal Mourning",
    description: "Melancholiic & Gothic Elegance",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#EEEAF0",
            black: "#121212",
        },

        primary: "#68589C",
        neutral: "#845159",
        background: "#0A080A",
        surface: "#151218",

        danger: "#9A16FA",
        warning: "#C47E29",
        info: "#5A8CAE",
        success: "#4A7F4E",

        typography: {
            primary: "#E5E3E8",
            neutral: "#938B96",
            accent: "#9A1F6A",
        },
    },
};
