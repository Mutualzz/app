import { type Theme } from "@emotion/react";

export const baseDarkTheme: Theme = {
    id: "baseDark",
    name: "Dark",
    description: "Default Dark Theme",
    type: "dark",
    colors: {
        common: {
            white: "#FFFFFF",
            black: "#000000",
        },

        primary: "#F24C7B",
        neutral: "#5A5A5A",
        background: "#0B0B0B",
        surface: "#1A1A1A",

        danger: "#FF4D4D",
        warning: "#FFC107",
        success: "#4CAF50",
        info: "#2196F3",

        typography: {
            primary: "#DADADA",
            neutral: "#9A9A9A",
            accent: "#A4243B",
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
