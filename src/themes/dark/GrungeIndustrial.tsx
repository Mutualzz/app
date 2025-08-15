import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grungeIndustrial",
    name: "Grunge & Industrial",
    description: "90s Underground Aesthetic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#A87C5A",
        neutral: "#A89A7A", // lighter, industrial taupe
        background: "#19171A", // deeper, muted rust-black
        surface: "#23241A", // distinct, layered rust
        danger: "#B85C5C",
        warning: "#E6C463",
        success: "#5CA88A",
        info: "#5C7FA8",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F4F4F4", // harmonized
            secondary: "#C5B6AA",
            accent: "#A87C5A", // match primary
            muted: "#A89A7A", // harmonized, matches neutral
        },
    },
};
