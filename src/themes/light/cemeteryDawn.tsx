import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const cemeteryDawnTheme: Theme = {
    ...baseLightTheme,
    id: "cemeteryDawn",
    name: "Cemetery Dawn",
    description: "Muted Morning Mist",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#8A6772",
        neutral: "#7B4B53",
        background: "#F4F2F2",
        surface: "#FFFFFF",
        danger: "#8F3A42",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
