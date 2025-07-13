import type { Theme } from "@mutualzz/ui";
import { baseLightTheme } from "@mutualzz/ui";

export const cemeteryDawnTheme: Theme = {
    ...baseLightTheme,
    id: "cemeteryDawn",
    name: "Cemetery Dawn",
    description: "Muted Morning Mist",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#70515C",
        neutral: "#7B4B53",
        background: "#F0F0F0",
        surface: "#F5F5F5",
        danger: "#8F3A42",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#70515C",
            disabled: "#7B4B53",
        },
    },
};
