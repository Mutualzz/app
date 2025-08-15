import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const victorianBloomTheme: Theme = {
    ...baseLightTheme,
    id: "victorianBloom",
    name: "Victorian Bloom",
    description: "Dark Floral Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A88A5A", // softer, less saturated
        neutral: "#A8A87A", // lighter, floral olive
        background: "#F5F7F3", // muted green-gray
        surface: "#E6EDE6", // distinct, slightly green
        danger: "#B85C5C", // softer red
        warning: "#E6C463", // softer yellow
        success: "#5CA88A", // softer green
        info: "#5C7FA8", // softer blue
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222", // harmonized
            secondary: "#333333",
            accent: "#A88A5A", // match primary
            muted: "#5A4A3A", // harmonized
        },
    },
};
