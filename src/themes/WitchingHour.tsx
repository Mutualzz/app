import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    id: "witching-hour",
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#9C4D73"),
        secondary: Color("#2A4B76"),
        background: Color("#0A0A12"),
        surface: Color("#151526"),

        error: Color("#AD1457"),
        warning: Color("#D4A017"),
        info: Color("#3896D0"),
        success: Color("#4CAF50"),

        typography: {
            primary: Color("#EAE5E5"),
            secondary: Color("#8C7C96"),
            accent: Color("#AD60A1"),
        },
    },
};
