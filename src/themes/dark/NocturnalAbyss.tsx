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
        primary: "#5A7C8A", // softer, less saturated
        neutral: "#3A4A5A", // more neutral
        background: "#151515", // harmonized with base
        surface: "#23232A", // harmonized with base
        danger: "#B85C5C", // softer red
        warning: "#E6C463", // softer yellow
        success: "#5CA88A", // softer green
        info: "#5C7FA8", // softer blue
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4", // harmonized
            secondary: "#B5B5B5",
            accent: "#5A7C8A", // match primary
            muted: "#3A4A5A", // harmonized
        },
    },
};
