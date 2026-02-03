import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const bloodMoonSerenadeTheme: Theme = {
    ...baseDarkTheme,
    id: "bloodMoonSerenade",
    name: "Blood Moon Serenade",
    description: "Crimson gradients blending romance and tragic dusk.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#F45A6A",
        neutral: "#B89CA9",
        background:
            "linear-gradient(90deg,#070608 0%,#181014 40%,#2C1620 70%,#7A2B3A 100%)",
        surface:
            "linear-gradient(90deg,#140F12 0%,#24171C 40%,#3A1E2A 80%,#F45A6A 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#F47B94",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#E8B7C1",
            accent: "#F45A6A",
            muted: "#A88B97",
        },
    },
};
