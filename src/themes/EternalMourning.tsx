import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternal-mourning",
    name: "Eternal Mourning",
    description: "Melancholiic & Gothic Elegance",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#2E2A4A",
        secondary: "#4C3A54",
        background: "#0A080A",
        surface: "#151218",

        error: "#9A16FA",
        warning: "#C47E29",
        info: "#5A8CAE",
        success: "#4A7F4E",

        typography: {
            primary: "#E5E3E8",
            secondary: "#938B96",
            accent: "#9A1F6A",
        },
    },
};
