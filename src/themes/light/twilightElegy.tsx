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
        primary: "#8F55B8",
        neutral: "#845159",
        background: "#F5F4F7",
        surface: "#FFFFFF",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
