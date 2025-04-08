import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const midghtEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnight-elegance",
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#8C3A46"),
        secondary: Color("#5A4A69"),
        background: Color("#0A0A0A"),
        surface: Color("#161616"),

        error: Color("#783937"),
        warning: Color("#B07A29"),
        info: Color("#5A7A8C"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E5E5E5"),
            secondary: Color("#A09EA6"),
            accent: Color("#783937"),
        },
    },
};
