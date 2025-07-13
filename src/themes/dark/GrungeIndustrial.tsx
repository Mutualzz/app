import type { Theme } from "@mutualzz/ui";

import { baseDarkTheme } from "@mutualzz/ui";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grungeIndustrial",
    name: "Grunge & Industrial",
    description: "90s Underground Aesthetic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#7A6450",
        neutral: "#8A4D5C",
        background: "#0E0E0E",
        surface: "#212121",
        danger: "#B2693D",
        warning: "#D4A033",
        success: "#50B660",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E6E6E6",
            secondary: "#C5B6AA",
            accent: "#A2785C",
            disabled: "#7E5F4A",
        },
    },
};
