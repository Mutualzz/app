import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const arcaneMidnightTheme: Theme = {
    ...baseDarkTheme,
    id: "arcaneMidnight",
    name: "Arcane Midnight",
    description: "Mystical arcane gradients with rich violet-blue layers.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background:
            "linear-gradient(90deg,#070608 0%,#14101C 40%,#241C3A 70%,#3C2B5C 100%)",
        surface:
            "linear-gradient(90deg,#19162A 0%,#23203A 40%,#3A2C5A 80%,#A06DDF 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#6C8CFF",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#CFC3E6",
            accent: "#A06DDF",
            muted: "#8B7CA8",
        },
    },
};
