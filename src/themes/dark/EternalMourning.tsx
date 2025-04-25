import { type Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternalMourning",
    name: "Eternal Mourning",
    description: "Melancholic & Gothic Elegance",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5C3A82",
        neutral: "#845159",
        background: "#0A080A",
        surface: "#151218",
        danger: "#8F3C74",
        warning: "#D4A033",
        info: "#607D8B",
        success: "#6FD36F",
        typography: {
            primary: "#E5E3E8",
            neutral: "#938B96",
            accent: "#8F55B8",
        },
    },
};
