import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "hauntedAesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal eerie hues with soft blue illumination.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5A8FE6",
        neutral: "#8CA3B7",
        background: "#14181E",
        surface: "#1B2636",
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
            accent: "#5A8FE6",
            muted: "#7C8B9C",
        },
    },
};
