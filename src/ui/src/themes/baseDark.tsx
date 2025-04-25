import type { Theme } from "../types";

export const baseDarkTheme: Theme = {
    id: "baseDark",
    name: "Dark",
    description: "Default Dark Theme",
    type: "dark",
    colors: {
        common: {
            white: "#E8E8E8",
            black: "#121212",
        },
        primary: "#6B425C",
        neutral: "#5A5A5A",
        background: "#0B0B0B",
        surface: "#1A1A1A",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#5A84B1",
        typography: {
            primary: "#C8C8C8",
            neutral: "#9A9A9A",
            accent: "#A84E68",
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
