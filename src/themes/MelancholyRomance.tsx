import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholy-romance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#C84B3C"),
        neutral: Color("#73678F"),
        background: Color("#0A0608"),
        surface: Color("#171117"),

        error: Color("#9C1123"),
        warning: Color("#B07A29"),
        info: Color("#5A7A8C"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E3E3E3"),
            neutral: Color("#A79D9C"),
            accent: Color("#7D1128"),
        },
    },
};
