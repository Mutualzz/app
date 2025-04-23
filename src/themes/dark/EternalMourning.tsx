import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternal-mourning",
    name: "Eternal Mourning",
    description: "Melancholiic & Gothic Elegance",
    colors: {
        ...baseDarkTheme.colors,

        common: {
            white: "#EEEAF0",
            black: "#121212",
        },

        primary: "#764099",
        neutral: "#845159",
        background: "#0A080A",
        surface: "#151218",

        danger: "#BA4CFF",
        warning: "#FFC045",
        info: "#45A9F7",
        success: "#6FD36F",

        typography: {
            primary: "#E5E3E8",
            neutral: "#938B96",
            accent: "#BA4CFF",
        },
    },
};
