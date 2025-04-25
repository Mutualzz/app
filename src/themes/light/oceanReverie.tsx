import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

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
        surface: "#F9F9F9",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
