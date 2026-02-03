import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const rustRequiemTheme: Theme = {
    ...baseDarkTheme,
    id: "rustRequiem",
    name: "Rust Requiem",
    description: "Grunge industrial gradients with warm oxidized layers.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#FF9B5A",
        neutral: "#B8A47A",
        background:
            "linear-gradient(90deg,#070605 0%,#18140F 40%,#2C2114 70%,#7A4E2B 100%)",
        surface:
            "linear-gradient(90deg,#15140F 0%,#201E18 40%,#3A2A1E 80%,#FF9B5A 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#FFB37A",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#D8C6B0",
            accent: "#FF9B5A",
            muted: "#A88B67",
        },
    },
};
