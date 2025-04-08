import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const crimsonLamentTheme: Theme = {
    ...baseDarkTheme,
    id: "crimson-lament",
    name: "Crimson Lament",
    description: "Dark Romance & Tragedy",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#6B1E28"),
        secondary: Color("#5A3D4E"),
        background: Color("#090606"),
        surface: Color("#1A0E10"),

        error: Color("#B52B3F"),
        warning: Color("#D98E04"),
        info: Color("#4A90E2"),
        success: Color("#4CAF50"),

        typography: {
            primary: Color("#E0D2D2"),
            secondary: Color("#8B7B7B"),
            accent: Color("#B52B3F"),
        },
    },
};
