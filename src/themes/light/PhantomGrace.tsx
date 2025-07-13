import type { Theme } from "@mutualzz/ui";
import { baseLightTheme } from "@mutualzz/ui";

export const phantomGraceTheme: Theme = {
    ...baseLightTheme,
    id: "phantomGrace",
    name: "Phantom Grace",
    description: "Eerie & Ethereal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#8F8EAD",
        neutral: "#6D4153",
        background: "#EBEBF1",
        surface: "#F4F5F8",
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
            accent: "#8F8EAD",
            disabled: "#7A7A8A",
        },
    },
};
