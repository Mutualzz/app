import { baseDarkTheme } from "@mutualzz/ui/themes/baseDark";
import type { Theme } from "@mutualzz/ui/types";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    id: "crimsonLament",
    name: "Crimson Lament",
    description: "Dark Romance & Tragedy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#7E1C24",
        neutral: "#5A3D4E",
        background: "#090606",
        surface: "#1A0E10",
        danger: "#A12B3D",
        warning: "#D4A033",
        info: "#4682B4",
        success: "#4CAF50",
        typography: {
            primary: "#E0D2D2",
            neutral: "#8B7B7B",
            accent: "#B72C3F",
        },
    },
};
