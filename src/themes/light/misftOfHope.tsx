import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const mistOfHopeTheme: Theme = {
    ...baseLightTheme,
    id: "mistOfHope",
    name: "Mist of Hope",
    description: "Ethereal Silver Blues",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#88A2B2",
        neutral: "#7D8F99",
        background: "#F1F4F6",
        surface: "#FFFFFF",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
