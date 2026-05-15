import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const oceanReverieTheme: Theme = {
    ...baseLightTheme,
    id: "oceanReverie",
    name: "Ocean Reverie",
    description: "Deep ocean-inspired calm with muted sea greens.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3CA9C8",
        neutral: "#8CA3B7",
        background: "#F5FAF9",
        surface: "#EAF4F2",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#3CA9C8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#3A5A4A",
            muted: "#5A5A5F",
        },
    },
};
