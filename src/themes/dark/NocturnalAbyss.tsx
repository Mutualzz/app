import type { Theme } from "@mutualzz/ui";

import { baseDarkTheme } from "@mutualzz/ui";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnalAbyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#436B84",
        neutral: "#7A5B7A",
        background: "#090909",
        surface: "#151515",
        danger: "#B33C50",
        warning: "#D4A033",
        success: "#58B96A",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E6E6E6",
            secondary: "#B5B5B5",
            accent: "#8AB1C6",
            disabled: "#6A4F68",
        },
    },
};
