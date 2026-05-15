import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const mysticAuroraTheme: Theme = {
    ...baseLightTheme,
    id: "mysticAurora",
    name: "Mystic Aurora",
    description: "Magical morning gradients with fresh green highlights.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#4DBE9A",
        neutral: "#7CA88A",
        background:
            "linear-gradient(90deg,#FBF8F6 0%,#F5F2EE 45%,#E9F4EA 75%,#A7E1C9 100%,#4DBE9A 100%)",
        surface:
            "linear-gradient(90deg,#F2EEE9 0%,#E6EFE9 45%,#CFEAE0 75%,#85CDB6 100%,#4DBE9A 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#A7E1C9",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4DBE9A",
            muted: "#5A5A5F",
        },
    },
};
