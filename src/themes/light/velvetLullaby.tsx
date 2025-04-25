import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

export const velvetLullabyTheme: Theme = {
    ...baseLightTheme,
    id: "velvetLullaby",
    name: "Velvet Lullaby",
    description: "Vintage & Dramatic",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#98625D",
        neutral: "#73678F",
        background: "#EDE9E8",
        surface: "#F7F5F5",
        danger: "#9C5050",
        warning: "#D4A033",
        success: "#4CAF50",
        info: "#607D8B",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#98625D",
        },
    },
};
