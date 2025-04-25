import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

export const twilightElegyTheme: Theme = {
    ...baseLightTheme,
    id: "twilightElegy",
    name: "Twilight Elegy",
    description: "Gothic Violet Glow",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#743DA3",
        neutral: "#845159",
        background: "#ECEAF1",
        surface: "#F5F3F8",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#743DA3",
        },
    },
};
