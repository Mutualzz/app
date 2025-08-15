import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui";

export const oceanReverieTheme: Theme = {
    ...baseLightTheme,
    id: "oceanReverie",
    name: "Ocean Reverie",
    description: "Deep Ocean Calm",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#3A5A4A",
        neutral: "#7A8A8A", // lighter, seafoam gray
        background: "#F3F5F4", // muted green-gray
        surface: "#E2E6E4", // distinct, slightly greenish
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
            accent: "#3A5A4A", // match primary
            muted: "#3A3A3A", // harmonized
        },
    },
};
