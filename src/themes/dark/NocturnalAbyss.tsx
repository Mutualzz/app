import type { Theme } from "@ui/types";

import { baseDarkTheme } from "@ui/themes/baseDark";

export const nocturnalAbyssTheme: Theme = {
    ...baseDarkTheme,
    id: "nocturnalAbyss",
    name: "Nocturnal Abyss",
    description: "Deep, Mysterious, and Shadowy",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#395A70",
        neutral: "#6A4F68",
        background: "#090909",
        surface: "#131313",
        danger: "#A12B3D",
        warning: "#D4A033",
        info: "#5E7A5F",
        success: "#6FD36F",
        typography: {
            primary: "#E0D6D6",
            neutral: "#8C8294",
            accent: "#5A7595",
        },
    },
};
