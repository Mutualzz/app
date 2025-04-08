import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternal-mourning",
    name: "Eternal Mourning",
    description: "Melancholiic & Gothic Elegance",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#68589C"),
        secondary: Color("#845159"),
        background: Color("#0A080A"),
        surface: Color("#151218"),

        error: Color("#9A16FA"),
        warning: Color("#C47E29"),
        info: Color("#5A8CAE"),
        success: Color("#4A7F4E"),

        typography: {
            primary: Color("#E5E3E8"),
            secondary: Color("#938B96"),
            accent: Color("#9A1F6A"),
        },
    },
};
