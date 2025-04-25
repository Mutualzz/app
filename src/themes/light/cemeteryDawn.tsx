import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

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
        background: "#EDEAEA",
        surface: "#F9F9F9",
        danger: "#8F3A42",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
