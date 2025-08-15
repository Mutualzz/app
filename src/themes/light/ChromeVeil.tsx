import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const chromeVeilTheme: Theme = {
    ...baseLightTheme,
    id: "chromeVeil",
    name: "Chrome Veil",
    description: "Industrial Soft Metal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#4A6A5A",
        neutral: "#8A8A8A", // lighter, silvery neutral
        background: "#F3F4F5", // muted cool gray
        surface: "#E2E4E6", // distinct, slightly metallic
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
            accent: "#4A6A5A", // match primary
            muted: "#3A3A3A", // harmonized
        },
    },
};
