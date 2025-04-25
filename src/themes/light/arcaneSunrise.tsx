import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const arcaneSunriseTheme: Theme = {
    ...baseLightTheme,
    id: "arcaneSunrise",
    name: "Arcane Sunrise",
    description: "Mystical Morning Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#60C297",
        neutral: "#2A4B76",
        background: "#EFF6F4",
        surface: "#FFFFFF",
        danger: "#AD1457",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#60C297",
    },
};
