import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const noirElegyTheme: Theme = {
    ...baseDarkTheme,
    id: "noirElegy",
    name: "Noir Elegy",
    description: "Melancholic gothic gradients with dusky purple swaths.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background:
            "linear-gradient(90deg,#070609 0%,#18101C 40%,#241C3A 70%,#6B3F7A 100%)",
        surface:
            "linear-gradient(90deg,#16141B 0%,#23232A 40%,#2E2738 80%,#A06DDF 100%)",
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
