import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

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
        background: "#E8EFF3",
        surface: "#F4F7F9",
        danger: "#8F3C74",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#5A84B1",
        typography: {
            primary: "#121212",
            neutral: "#5A5A5A",
            accent: "#6D8A9C",
        },
    },
};
