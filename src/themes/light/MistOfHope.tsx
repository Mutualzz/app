import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const mistOfHopeTheme: Theme = {
    ...baseLightTheme,
    id: "mistOfHope",
    name: "Mist of Hope",
    description: "Soft & Uplifting",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#5A7C8A",
        neutral: "#7A8A9A", // lighter, hopeful blue-gray
        background: "#F4F6F8", // muted blue-gray
        surface: "#E6EAEE", // distinct, slightly blue
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222", // harmonized
            secondary: "#333333",
            accent: "#5A7C8A", // match primary
            muted: "#3A4A5A", // harmonized
        },
    },
};
