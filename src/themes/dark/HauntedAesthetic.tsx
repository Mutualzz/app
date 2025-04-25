import type { Theme } from "@mutualzz/ui/src/types";

import { baseDarkTheme } from "@mutualzz/ui/themes/baseDark";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "hauntedAesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Eerie, and Softly Dark",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5E698F",
        neutral: "#6D4153",
        background: "#0C0C0C",
        surface: "#171717",
        danger: "#8F3C74",
        warning: "#D4A033",
        info: "#88A2B2",
        success: "#6FD36F",
        typography: {
            primary: "#E0E0E0",
            neutral: "#8A8A8A",
            accent: "#AFAEC7",
        },
    },
};
