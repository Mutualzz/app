import type { Theme } from "@emotion/react";

import { baseDarkTheme } from "@mutualzz/ui";

export const shadowheartTheme: Theme = {
    ...baseDarkTheme,
    id: "shadowheart",
    name: "Shadowheart",
    description: "Dystopian, Sharp, and Industrial",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#454854",
        neutral: "#7A5B67",
        background: "#08090A",
        surface: "#1A1B1E",
        danger: "#9A3F78",
        warning: "#D4A033",
        success: "#5ACB68",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#E8E8E8",
            secondary: "#B5B5B5",
            accent: "#7BA1AD",
            disabled: "#6B4F59",
        },
    },
};
