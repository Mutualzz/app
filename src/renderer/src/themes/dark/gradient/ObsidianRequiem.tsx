import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const obsidianRequiemTheme: Theme = {
    ...baseDarkTheme,
    id: "obsidianRequiem",
    name: "Obsidian Requiem",
    description: "Intense obsidian gradients with brooding violet undertones.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6D5AE2",
        neutral: "#8B8CA8",
        background:
            "linear-gradient(90deg,#070608 0%,#18141F 40%,#241C3A 70%,#3C2B5C 100%)",
        surface:
            "linear-gradient(90deg,#16141A 0%,#23232C 40%,#2C2A38 80%,#6D5AE2 100%)",
        danger: "#E04B5A",
        warning: "#D1A24A",
        success: "#4FAF7A",
        info: "#6C8CFF",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#B6B8C8",
            accent: "#6D5AE2",
            muted: "#8B8CA8",
        },
    },
};
