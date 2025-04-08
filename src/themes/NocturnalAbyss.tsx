import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnal-abyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#7F4F9D"),
        secondary: Color("#6A4F68"),
        background: Color("#090909"),
        surface: Color("#131313"),

        error: Color("#C3073F"),
        warning: Color("#B07A29"),
        info: Color("#5A7A8C"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E0D6D6"),
            secondary: Color("#8C8294"),
            accent: Color("#C3073F"),
        },
    },
};
