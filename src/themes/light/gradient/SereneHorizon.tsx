import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const sereneHorizonTheme: Theme = {
    ...baseLightTheme,
    id: "sereneHorizon",
    name: "Serene Horizon",
    description: "Uplifting gradients blending soft sky blues and grays.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#5A8FE6",
        neutral: "#7CA7B7",
        background:
            "linear-gradient(90deg,#F6FAFB 0%,#EEF5F8 45%,#DDEFF4 75%,#8CC0DA 100%,#5A8FE6 100%)",
        surface:
            "linear-gradient(90deg,#EEF6F9 0%,#DDEFF4 45%,#B7DFEE 75%,#8CC0DA 100%,#5A8FE6 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#5A8FE6",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4A90B0",
            muted: "#5A5A5F",
        },
    },
};
