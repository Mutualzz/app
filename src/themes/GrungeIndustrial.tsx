import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grunge-industrial",
    name: "Grunde & Industrial",
    description: "90s Underground Aesthetic",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#56606A"),
        neutral: Color("#7E4050"),
        background: Color("#101010"),
        surface: Color("#1E1E1E"),

        error: Color("#A54242"),
        warning: Color("#C49A29"),
        info: Color("#5A7A8C"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#DFDFDF"),
            neutral: Color("#9E9E9E"),
            accent: Color("#6B5B4C"),
        },
    },
};
