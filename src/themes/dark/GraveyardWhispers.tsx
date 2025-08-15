import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyardWhispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#7A7A8A",
        neutral: "#7A8A9A", // lighter, cold blue-gray
        background: "#19171D", // deeper, muted blue-black
        surface: "#23243A", // distinct, layered blue-gray
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4", // harmonized
            secondary: "#C2C2C2",
            accent: "#7A7A8A", // match primary
            muted: "#7A8A9A", // harmonized, matches neutral
        },
    },
};
