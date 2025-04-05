import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    colors: {
        primary: "#31363F",
        secondary: "#4E4C59",
        background: "#08090A",
        surface: "#16171A",
        typography: {
            primary: "#DADADA",
            secondary: "#8A8D92",
            accent: "#FF3D00",
        },
    },
};
