import { type Theme } from "@emotion/react";
import Color from "color";

export const baseDarkTheme: Theme = {
    id: "baseDark",
    name: "Dark",
    description: "Default Dark Theme",
    colors: {
        primary: Color("#F24C7B"),
        neutral: Color("#5A5A5A"),
        background: Color("#0B0B0B"),
        surface: Color("#1A1A1A"),

        error: Color("#FF4D4D"),
        warning: Color("#FFC107"),
        success: Color("#4CAF50"),
        info: Color("#2196F3"),

        typography: {
            primary: Color("#DADADA"),
            neutral: Color("#9A9A9A"),
            accent: Color("#A4243B"),
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
