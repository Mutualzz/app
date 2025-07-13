import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholyRomance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#9E6D78",
        neutral: "#7F70A2",
        background: "#0A0608",
        surface: "#181218",
        danger: "#B05454",
        warning: "#D4A033",
        success: "#58B96A",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E8E8E8",
            secondary: "#C0A5AF",
            accent: "#B37C88",
            disabled: "#73678F",
        },
    },
};
