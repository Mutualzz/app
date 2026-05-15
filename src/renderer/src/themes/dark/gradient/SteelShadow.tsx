import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const steelShadowTheme: Theme = {
    ...baseDarkTheme,
    id: "steelShadow",
    name: "Steel Shadow",
    description: "Sharp dystopian gradients with cold steel blues.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#7C8B9C",
        neutral: "#A0A0AA",
        background:
            "linear-gradient(90deg,#07080A 0%,#181B1F 40%,#232A36 70%,#4A5A6B 100%)",
        surface:
            "linear-gradient(90deg,#1C2232 0%,#23283A 40%,#2E3350 80%,#7C8B9C 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#7CA7E6",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#B6C3D1",
            accent: "#7C8B9C",
            muted: "#A0A0AA",
        },
    },
};
