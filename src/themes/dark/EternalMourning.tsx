import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternalMourning",
    name: "Eternal Mourning",
    description: "Melancholic & Gothic Elegance",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6A4A8A", // softer, less saturated
        neutral: "#3A3A5A", // more neutral
        background: "#18121D", // harmonized with base
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
            secondary: "#CAB8D8",
            accent: "#6A4A8A", // match primary
            muted: "#3A3A5A", // harmonized
        },
    },
};
