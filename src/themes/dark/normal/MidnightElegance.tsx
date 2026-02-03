import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const midnightEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnightElegance",
    name: "Midnight Elegance",
    description: "Dark Victorian elegance with luxe violet accents.",
    adaptive: false,
    type: "dark",
    style: "normal",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background: "#18101C",
        surface: "#241C3A",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#B884F0",
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
