import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const tranquilDepthsTheme: Theme = {
    ...baseLightTheme,
    id: "tranquilDepths",
    name: "Tranquil Depths",
    description: "Calm oceanic gradients with layered sea tones.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3CA9C8",
        neutral: "#8CA3B7",
        background:
            "linear-gradient(90deg,#F5FAF9 0%,#EAF4F2 45%,#CFE9E5 75%,#67B49B 100%,#3CA9C8 100%)",
        surface:
            "linear-gradient(90deg,#E9F4F1 0%,#D3ECE7 45%,#B2E0D6 75%,#6FB99F 100%,#3CA9C8 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#3CA9C8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#3CA9C8",
            muted: "#5A5A5F",
        },
    },
};
