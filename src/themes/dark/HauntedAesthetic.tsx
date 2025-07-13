import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "hauntedAesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Eerie, and Softly Dark",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#66739B",
        neutral: "#7B4F5F",
        background: "#0C0C0C",
        surface: "#191919",
        danger: "#9A406E",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E8E8E8",
            secondary: "#B5B5B5",
            accent: "#A07BA3",
            disabled: "#7B4F5F",
        },
    },
};
