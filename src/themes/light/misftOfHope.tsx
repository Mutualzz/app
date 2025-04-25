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
        primary: "#6D8A9C",
        neutral: "#7D8F99",
        background: "#E9EFF2",
        surface: "#F9F9F9",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
    },
};
