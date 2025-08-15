import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnalAbyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5A7C8A",
        neutral: "#3A4A5A",
        background: "#151515",
        surface: "#23232A",
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4",
            secondary: "#B5B5B5",
            accent: "#5A7C8A",
            muted: "#3A4A5A",
        },
    },
};
