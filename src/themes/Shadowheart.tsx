import { type Theme } from "@emotion/react";
import Color from "color";
import { baseDarkTheme } from "./baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    colors: {
        ...baseDarkTheme.colors,
        primary: Color("#4A5A64"),
        neutral: Color("#6B4F59"),
        background: Color("#08090A"),
        surface: Color("#16171A"),

        error: Color("#FF3D00"),
        warning: Color("#F2A900"),
        info: Color("#5A7A8C"),
        success: Color("#4CAF50"),

        typography: {
            primary: Color("#DADADA"),
            neutral: Color("#8A8D92"),
            accent: Color("#FF3D00"),
        },
    },
};
