import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

export const phantomGraceTheme: Theme = {
    ...baseLightTheme,
    id: "phantomGrace",
    name: "Phantom Grace",
    description: "Eerie & Ethereal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#8F8EAD",
        neutral: "#6D4153",
        background: "#EBEBF1",
        surface: "#F4F5F8",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#8F8EAD",
        },
    },
};
