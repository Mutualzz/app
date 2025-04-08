import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fog-of-despair",
    name: "Fog of Despair",
    description: "Cold, Distant, and Ethereal",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#4A5A6A"),
        neutral: Color("#7D8F99"),
        background: Color("#0B0D10"),
        surface: Color("#171C24"),

        error: Color("#A33E4C"),
        warning: Color("#C47E29"),
        info: Color("#5C8DB6"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E3E8EC"),
            neutral: Color("#A2A9B1"),
            accent: Color("#5C677D"),
        },
    },
};
