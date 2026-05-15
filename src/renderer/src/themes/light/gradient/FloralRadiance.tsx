import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const floralRadianceTheme: Theme = {
    ...baseLightTheme,
    id: "floralRadiance",
    name: "Floral Radiance",
    description: "Floral radiant gradients with warm golden undertones.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#D6A23A",
        neutral: "#A89A62",
        background:
            "linear-gradient(90deg,#FBFCF9 0%,#F4F7F2 45%,#F6E5B8 75%,#F0D27A 100%,#D6A23A 100%)",
        surface:
            "linear-gradient(90deg,#F6F7EE 0%,#EAEFD9 45%,#E0D8B4 75%,#D6B56A 100%,#D6A23A 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#F0D27A",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#D6A23A",
            muted: "#5A5A5F",
        },
    },
};
