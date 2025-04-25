import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

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
        surface: "#F9F9F9",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
