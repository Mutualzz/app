import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const spectralVeilTheme: Theme = {
    ...baseDarkTheme,
    id: "spectralVeil",
    name: "Spectral Veil",
    description: "Ethereal soft-dark gradients with luminous blue highlights.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5A8FE6",
        neutral: "#8CA3B7",
        background:
            "linear-gradient(90deg,#07080A 0%,#14181E 40%,#1B2636 70%,#3A4F7A 100%)",
        surface:
            "linear-gradient(90deg,#161822 0%,#202633 40%,#2A3A4B 80%,#5A8FE6 100%)",
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
