import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

export const oceanReverieTheme: Theme = {
    ...baseLightTheme,
    id: "oceanReverie",
    name: "Ocean Reverie",
    description: "Deep Ocean Calm",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#49604A",
        neutral: "#6A4F68",
        background: "#E6ECEA",
        surface: "#F5F7F6",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#49604A",
        },
    },
};
