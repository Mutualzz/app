import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

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
    },
};
