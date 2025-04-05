import { Theme } from "@emotion/react";

export const baseDarkTheme: Theme = {
    id: "baseDark",
    name: "Dark",
    description: "Default dark theme",
    colors: {
        primary: "#7A1F3D",
        secondary: "#5A5A5A",
        background: "#0B0B0B",
        surface: "#1A1A1A",
        typography: {
            primary: "#DADADA",
            secondary: "#9A9A9A",
            accent: "#A4243B",
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        fontWeight: 400,
        fontWeightBold: 700,
        fontWeightMedium: 600,
        h1: {
            fontSize: 40,
            fontWeight: 700,
        },
        h2: {
            fontSize: 32,
            fontWeight: 600,
        },
        h3: {
            fontSize: 28,
            fontWeight: 600,
        },
        lineHeight: 1.5,
    },
};
