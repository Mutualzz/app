import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const chromeVeilTheme: Theme = {
    ...baseLightTheme,
    id: "chromeVeil",
    name: "Chrome Veil",
    description: "Soft metallic neutrals with a subtle industrial sheen.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#AEB6CF",
        neutral: "#8C9BAA",
        background: "#F4F7F8",
        surface: "#EAF0F2",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#AEB6CF",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4A6A5A",
            muted: "#5A5A5F",
        },
    },
};
