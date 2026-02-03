import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const roseDuskTheme: Theme = {
    ...baseLightTheme,
    id: "roseDusk",
    name: "Rose Dusk",
    description: "Romantic soft gradients shifting from blush to deep rose.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#F48CA7",
        neutral: "#CDAFB9",
        background:
            "linear-gradient(90deg,#F9F6F7 0%,#F3EDF0 45%,#F0D6DE 75%,#E37586 100%,#F48CA7 100%)",
        surface:
            "linear-gradient(90deg,#F2EBEE 0%,#EAD7DB 45%,#DFB7C2 75%,#D36A7D 100%,#F48CA7 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#F48CA7",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#F48CA7",
            muted: "#5A5A5F",
        },
    },
};
