import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const oceanReverieTheme: Theme = {
    ...baseLightTheme,
    id: "oceanReverie",
    name: "Ocean Reverie",
    description: "Deep Ocean Calm",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#5E7A5F",
        neutral: "#6A4F68",
        background: "#EEF3F1",
        surface: "#FFFFFF",
        danger: "#A12B3D",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
