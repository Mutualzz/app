import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "haunted-aesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Erie, and Softly Dark",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#ECECEC",
            black: "#121212",
        },

        primary: "#684389",
        neutral: "#6D4153",
        background: "#0C0C0C",
        surface: "#171717",

        danger: "#BA4CFF",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E0E0E0",
            neutral: "#8A8A8A",
            accent: "#BA4CFF",
        },
    },
};
