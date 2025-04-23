import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#E2E2E2",
            black: "#121212",
        },

        primary: "#4A5A64",
        neutral: "#6B4F59",
        background: "#08090A",
        surface: "#16171A",

        danger: "#FF3D00",
        warning: "#F2A900",
        info: "#5A7A8C",
        success: "#4CAF50",

        typography: {
            primary: "#DADADA",
            neutral: "#8A8D92",
            accent: "#FF3D00",
        },
    },
};
