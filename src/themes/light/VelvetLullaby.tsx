import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const velvetLullabyTheme: Theme = {
    ...baseLightTheme,
    id: "velvetLullaby",
    name: "Velvet Lullaby",
    description: "Vintage & Dramatic",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A86A7A",
        neutral: "#B8A8B8", // lighter, vintage plum-gray
        background: "#F5F4F6", // muted plum-gray
        surface: "#EDE6EC", // distinct, slightly plum
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
            accent: "#A86A7A", // match primary
            muted: "#B8A8B8", // harmonized, matches neutral
        },
    },
};
