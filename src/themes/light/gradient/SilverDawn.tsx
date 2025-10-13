import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const silverDawnTheme: Theme = {
    ...baseLightTheme,
    id: "silverDawn",
    name: "Silver Dawn",
    description: "Industrial metallic gradients",
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#4A6A5A",
        neutral: "#555555",
        background:
            "linear-gradient(90deg,#F3F4F5 0%,#F3F4F5 55%,#EEF0F2 72%,#E9ECEF 82%,#E2E4E6 100%)",
        surface:
            "linear-gradient(90deg,#E2E4E6 0%,#E2E4E6 55%,#CED5D3 70%,#B8C4C0 85%,#4A6A5A 100%)",
        danger: "#B3261E",
        warning: "#8F6500",
        success: "#1F6E34",
        info: "#0F5DA8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#4A6A5A",
            muted: "#5A5A5F",
        },
    },
};
