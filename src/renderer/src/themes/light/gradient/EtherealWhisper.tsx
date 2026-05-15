import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const etherealWhisperTheme: Theme = {
    ...baseLightTheme,
    id: "etherealWhisper",
    name: "Ethereal Whisper",
    description: "Ethereal gradients with delicate aqua and misty whites.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3CB8B3",
        neutral: "#7CA7A7",
        background:
            "linear-gradient(90deg,#F0FBFA 0%,#E6F7F5 45%,#BEEBE7 75%,#5AC2BD 100%,#3CB8B3 100%)",
        surface:
            "linear-gradient(90deg,#E9F9F8 0%,#D3F3F1 45%,#A3E6E2 75%,#5AC2BD 100%,#3CB8B3 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#3FB8AD",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#2AA8A3",
            muted: "#5A5A5F",
        },
    },
};
