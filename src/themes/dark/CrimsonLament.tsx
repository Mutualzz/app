import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    name: "Crimson Lament",
    description: "Dark Romance & Tragedy",
    colors: {
        primary: "#6B1E28",
        secondary: "#401921",
        background: "#090606",
        surface: "#1A0E10",
        typography: {
            primary: "#E0D2D2",
            secondary: "#8B7B7B",
            accent: "#B52B3F",
        },
    },
};
