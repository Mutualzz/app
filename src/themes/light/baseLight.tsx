import { type Theme } from "@emotion/react";

export const baseLightTheme: Theme = {
    id: "baseLight",
    name: "Light",
    description: "Default Light Theme",
    type: "light",
    colors: {
        common: {
            white: "#FFFFFF",
            black: "#000000",
        },

        primary: "#F24C7B",
        neutral: "#5A5A5A",
        background: "#F5F5F5",
        surface: "#FAFAFA",

        danger: "#FF4D4D",
        warning: "#FFC107",
        success: "#4CAF50",
        info: "#2196F3",

        typography: {
            primary: "#202020",
            neutral: "#5A5A5A",
            accent: "#A4243B",
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
