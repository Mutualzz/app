import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const twilightElegyTheme: Theme = {
    ...baseLightTheme,
    id: "twilightElegy",
    name: "Twilight Elegy",
    description: "Gothic violet glow with cool, moody accents.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background: "#F2F4FB",
        surface: "#E9ECFB",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#A06DDF",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4A5FA0",
            muted: "#5A5A5F",
        },
    },
};
