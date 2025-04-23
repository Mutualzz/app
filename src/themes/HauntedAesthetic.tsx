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

        primary: "#525C7D",
        neutral: "#6D4153",
        background: "#0C0C0C",
        surface: "#171717",

        danger: "#8A3B4C",
        warning: "#B07A29",
        info: "#5A7A8C",
        success: "#4A7F4E",

        typography: {
            primary: "#E0E0E0",
            neutral: "#8A8A8A",
            accent: "#6E4A68",
        },
    },
};
