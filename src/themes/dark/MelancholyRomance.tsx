import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholyRomance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#A86A7A", // softer, less saturated
        neutral: "#B8A8B8", // lighter, vintage plum-gray
        background: "#181218", // harmonized with base
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
            secondary: "#C0A5AF",
            accent: "#A86A7A", // match primary
            muted: "#B8A8B8", // harmonized, matches neutral
        },
    },
};
