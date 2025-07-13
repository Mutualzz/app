import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const mistOfHopeTheme: Theme = {
    ...baseLightTheme,
    id: "mistOfHope",
    name: "Mist of Hope",
    description: "Ethereal Silver Blues",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#6D8A9C",
        neutral: "#7D8F99",
        background: "#E8EFF3",
        surface: "#F4F7F9",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#6D8A9C",
            disabled: "#7D8F99",
        },
    },
};
