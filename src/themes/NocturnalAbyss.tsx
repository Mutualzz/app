import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnal-abyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#2D1B3D",
        secondary: "#3E2C41",
        background: "#090909",
        surface: "#131313",

        error: "#C3073F",
        warning: "#B07A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#E0D6D6",
            secondary: "#8C8294",
            accent: "#C3073F",
        },
    },
};
