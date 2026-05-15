import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const phantomMistTheme: Theme = {
    ...baseDarkTheme,
    id: "phantomMist",
    name: "Phantom Mist",
    description: "Ethereal misty gradients with deep ocean shadows.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#3CA9C8",
        neutral: "#8CA3B7",
        background:
            "linear-gradient(90deg,#070709 0%,#14181B 40%,#1B2A32 70%,#3A6B82 100%)",
        surface:
            "linear-gradient(90deg,#15181B 0%,#20272A 40%,#2B3638 80%,#3CA9C8 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#5CB8E6",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#B6C3D1",
            accent: "#3CA9C8",
            muted: "#7C8B9C",
        },
    },
};
