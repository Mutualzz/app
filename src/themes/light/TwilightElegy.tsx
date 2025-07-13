import type { Theme } from "@mutualzz/ui";
import { baseLightTheme } from "@mutualzz/ui";

export const twilightElegyTheme: Theme = {
    ...baseLightTheme,
    id: "twilightElegy",
    name: "Twilight Elegy",
    description: "Gothic Violet Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#743DA3",
        neutral: "#845159",
        background: "#ECEAF1",
        surface: "#F5F3F8",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#743DA3",
            disabled: "#7B5A7A",
        },
    },
};
