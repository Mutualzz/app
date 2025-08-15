import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witchingHour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6A4A8A",
        neutral: "#8A7CA8", // lighter, mystical indigo-gray
        background: "#18162A", // deeper, muted indigo-black
        surface: "#23203A", // distinct, layered indigo
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4", // harmonized
            secondary: "#B8B8D0",
            accent: "#6A4A8A", // match primary
            muted: "#8A7CA8", // harmonized, matches neutral
        },
    },
};
