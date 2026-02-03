import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const mourningMistTheme: Theme = {
    ...baseLightTheme,
    id: "mourningMist",
    name: "Mourning Mist",
    description: "Misty muted gradients with solemn, soft tones.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A88082",
        neutral: "#A89A9A",
        background:
            "linear-gradient(90deg,#FBFBFC 0%,#F5F5F7 45%,#ECE9EE 75%,#B37E80 100%,#A88082 100%)",
        surface:
            "linear-gradient(90deg,#F4F2F4 0%,#ECE7EA 45%,#D9C8CA 75%,#B37E80 100%,#A88082 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#B37E80",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#7A4A4A",
            muted: "#5A5A5F",
        },
    },
};
