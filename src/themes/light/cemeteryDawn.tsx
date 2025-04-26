import { baseLightTheme } from "@ui/themes/baseLight";
import type { Theme } from "@ui/types";

export const cemeteryDawnTheme: Theme = {
    ...baseLightTheme,
    id: "cemeteryDawn",
    name: "Cemetery Dawn",
    description: "Muted Morning Mist",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#70515C",
        neutral: "#7B4B53",
        background: "#F0F0F0",
        surface: "#F5F5F5",
        danger: "#8F3A42",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#70515C",
        },
    },
};
