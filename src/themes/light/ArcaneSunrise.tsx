import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const arcaneSunriseTheme: Theme = {
    ...baseLightTheme,
    id: "arcaneSunrise",
    name: "Arcane Sunrise",
    description: "Mystical Morning Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3A7C6A",
        neutral: "#7A6A5A", // lighter, mystical taupe
        background: "#F7F5F3", // muted gold-gray
        surface: "#EDE9E6", // distinct, slightly golden
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222", // harmonized
            secondary: "#333333",
            accent: "#3A7C6A", // match primary
            muted: "#3A4A5A", // harmonized
        },
    },
};
