import type { Theme } from "@mutualzz/ui/types";

import { baseDarkTheme } from "@mutualzz/ui/themes/baseDark";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#3A3D4A",
        neutral: "#6B4F59",
        background: "#08090A",
        surface: "#16171A",
        danger: "#8F3C74",
        warning: "#D4A033",
        info: "#5AB1A1",
        success: "#4CAF50",
        typography: {
            primary: "#DADADA",
            neutral: "#8A8D92",
            accent: "#5AB1A1",
        },
    },
};
