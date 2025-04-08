import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "haunted-aesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Erie, and Softly Dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#525C7D"),
        secondary: Color("#6D4153"),
        background: Color("#0C0C0C"),
        surface: Color("#171717"),

        error: Color("#8A3B4C"),
        warning: Color("#B07A29"),
        info: Color("#5A7A8C"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E0E0E0"),
            secondary: Color("#8A8A8A"),
            accent: Color("#6E4A68"),
        },
    },
};
