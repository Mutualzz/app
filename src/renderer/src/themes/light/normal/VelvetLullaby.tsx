import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const velvetLullabyTheme: Theme = {
    ...baseLightTheme,
    id: "velvetLullaby",
    name: "Velvet Lullaby",
    description: "Vintage, dramatic palette with soft rose tones.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#F48CA7",
        neutral: "#CDAFB9",
        background: "#F9F6F7",
        surface: "#F3EDF0",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#F48CA7",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#F48CA7",
            muted: "#5A5A5F",
        },
    },
};
