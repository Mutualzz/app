import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian industrial palette with cool steel accents.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#7C8B9C",
        neutral: "#A0A0AA",
        background: "#181B1F",
        surface: "#232A36",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#7CA7E6",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#B6C3D1",
            accent: "#7C8B9C",
            muted: "#A0A0AA",
        },
    },
};
