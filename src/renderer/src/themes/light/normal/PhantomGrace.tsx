import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const phantomGraceTheme: Theme = {
    ...baseLightTheme,
    id: "phantomGrace",
    name: "Phantom Grace",
    description: "Ethereal, slightly eerie soft teal accents.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3CB8B3",
        neutral: "#7CA7A7",
        background: "#F0FBFA",
        surface: "#E6F7F5",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#3FB8AD",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4A7D79",
            muted: "#5A5A5F",
        },
    },
};
