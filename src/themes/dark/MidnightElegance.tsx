import type { Theme } from "@mutualzz/ui";

import { baseDarkTheme } from "@mutualzz/ui";

export const midnightEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnightElegance",
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#565B85",
        neutral: "#6B5A7D",
        background: "#0A0A0A",
        surface: "#181818",
        danger: "#894444",
        warning: "#D4A033",
        success: "#5DC472",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E6E6E6",
            secondary: "#B5B5B5",
            accent: "#8885B2",
            disabled: "#5A4A69",
        },
    },
};
