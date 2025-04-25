import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const phantomGraceTheme: Theme = {
    ...baseLightTheme,
    id: "phantomGrace",
    name: "Phantom Grace",
    description: "Eerie & Ethereal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#AFAEC7",
        neutral: "#6D4153",
        background: "#F4F4F8",
        surface: "#FFFFFF",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
