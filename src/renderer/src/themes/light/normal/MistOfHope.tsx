import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const mistOfHopeTheme: Theme = {
    ...baseLightTheme,
    id: "mistOfHope",
    name: "Mist of Hope",
    description: "Soft, uplifting tones with airy blue-gray hints.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#5A8FE6",
        neutral: "#7CA7B7",
        background: "#F6FAFB",
        surface: "#EEF5F8",
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
            accent: "#3F6070",
            muted: "#5A5A5F",
        },
    },
};
