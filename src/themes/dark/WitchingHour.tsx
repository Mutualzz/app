import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witchingHour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5A4599",
        neutral: "#3A5B86",
        background: "#0A0A12",
        surface: "#18182A",
        danger: "#B41761",
        warning: "#D4A033",
        success: "#72D372",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#EDEDED",
            secondary: "#B8B8D0",
            accent: "#9D82D0",
            disabled: "#5A4A72",
        },
    },
};
