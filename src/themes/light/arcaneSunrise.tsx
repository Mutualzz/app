import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

export const arcaneSunriseTheme: Theme = {
    ...baseLightTheme,
    id: "arcaneSunrise",
    name: "Arcane Sunrise",
    description: "Mystical Morning Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#4DA380",
        neutral: "#2A4B76",
        background: "#E4ECE9",
        surface: "#F4F7F6",
        danger: "#AD1457",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#60C297",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#4DA380",
        },
    },
};
