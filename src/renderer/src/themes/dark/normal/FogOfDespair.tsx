import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fogOfDespair",
    name: "Fog of Despair",
    description: "Cold, distant tones with airy, ethereal fog hues.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#3CA9C8",
        neutral: "#8CA3B7",
        background: "#14181B",
        surface: "#1B2A32",
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
