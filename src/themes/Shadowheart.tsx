import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#31363F",
        secondary: "#4E4C59",
        background: "#08090A",
        surface: "#16171A",

        error: "#FF3D00",
        warning: "#F2A900",
        info: "#5A7A8C",
        success: "#4CAF50",

        typography: {
            primary: "#DADADA",
            secondary: "#8A8D92",
            accent: "#FF3D00",
        },
    },
};
