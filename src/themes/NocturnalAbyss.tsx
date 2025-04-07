import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnal-abyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#2D1B3D",
        secondary: "#3E2C41",
        background: "#090909",
        surface: "#131313",

        typography: {
            primary: "#E0D6D6",
            secondary: "#8C8294",
            accent: "#C3073F",
        },
    },
};
