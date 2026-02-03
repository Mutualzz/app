import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const victorianBloomTheme: Theme = {
    ...baseLightTheme,
    id: "victorianBloom",
    name: "Victorian Bloom",
    description: "Light theme with Victorian floral tones and muted warmth.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#D6A23A",
        neutral: "#A89A62",
        background: "#FBFCF9",
        surface: "#F4F7F2",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#F0D27A",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#D6A23A",
            muted: "#5A5A5F",
        },
    },
};
