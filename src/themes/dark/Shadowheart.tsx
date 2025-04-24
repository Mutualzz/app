import { type Theme } from "@emotion/react";

import { baseDarkTheme } from "./baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        common: {
            white: "#E2E2E2",
            black: "#121212",
        },

        primary: "#784B75",
        neutral: "#6B4F59",
        background: "#08090A",
        surface: "#16171A",

        danger: "#BA4CFF",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#DADADA",
            neutral: "#8A8D92",
            accent: "#BA4CFF",
        },
    },
};
