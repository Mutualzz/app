import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

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
        surface: "#F9F9F9",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
