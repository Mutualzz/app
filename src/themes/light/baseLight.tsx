import { type Theme } from "@emotion/react";

export const baseLightTheme: Theme = {
    id: "baseLight",
    name: "Light",
    description: "Default Light Theme",
    type: "light",
    colors: {
        common: {
            white: "#FFFFFF",
            black: "#121212",
        },
        primary: "#E0577E",
        neutral: "#5A5A5A",
        background: "#F5F5F5",
        surface: "#FAFAFA",
        danger: "#C7323F",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5A84B1",
        typography: {
            primary: "#202020",
            neutral: "#5A5A5A",
            accent: "#B04A62",
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
