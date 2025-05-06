import type { Theme } from "@ui/types";

import { baseDarkTheme } from "@ui/themes/baseDark";

export const grungeIndustrialTheme: Theme = {
    ...baseDarkTheme,
    id: "grungeIndustrial",
    name: "Grunge & Industrial",
    description: "90s Underground Aesthetic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6B5B4B",
        neutral: "#7E4050",
        background: "#101010",
        surface: "#1E1E1E",
        danger: "#A3643D",
        warning: "#D4A033",
        info: "#607D8B",
        success: "#4CAF50",
    },
};
