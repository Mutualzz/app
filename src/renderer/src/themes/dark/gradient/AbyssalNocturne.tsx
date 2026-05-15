import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const abyssalNocturneTheme: Theme = {
    ...baseDarkTheme,
    id: "abyssalNocturne",
    name: "Abyssal Nocturne",
    description: "Deep mysterious gradients with oceanic indigo hues.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#2491c5",
        neutral: "#8CA3B7",
        background:
            "linear-gradient(90deg,#07080A 0%,#10141A 40%,#14293A 70%,#1B4A5F 100%)",
        surface:
            "linear-gradient(90deg,#15171A 0%,#23232A 40%,#26405A 80%,#2491c5 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#4A9DFF",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#B6C3D1",
            accent: "#2491c5",
            muted: "#7C8B9C",
        },
    },
};
