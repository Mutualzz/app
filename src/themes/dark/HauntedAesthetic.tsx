import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "hauntedAesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Eerie, and Softly Dark",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6A7CA8", // softer, less saturated
        neutral: "#7A8A9A", // lighter, ethereal blue-gray
        background: "#191919", // harmonized with base
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
            accent: "#6A7CA8", // match primary
            muted: "#7A8A9A", // harmonized, matches neutral
        },
    },
};
