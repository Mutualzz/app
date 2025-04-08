import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyard-whispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#4A6076"),
        neutral: Color("#7B4B53"),
        background: Color("#0D0D0D"),
        surface: Color("#1A1A1A"),

        error: Color("#8F3A42"),
        warning: Color("#B07A1A"),
        info: Color("#5A7A8C"),
        success: Color("#4A6A4E"),

        typography: {
            primary: Color("#D1D1D1"),
            neutral: Color("#939393"),
            accent: Color("#8F3A42"),
        },
    },
};
