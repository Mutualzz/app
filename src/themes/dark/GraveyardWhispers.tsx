import type { Theme } from "@mutualzz/ui";

import { baseDarkTheme } from "@mutualzz/ui";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyardWhispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#6B676B",
        neutral: "#8A5660",
        background: "#0D0D0D",
        surface: "#1D1D1D",
        danger: "#9C4850",
        warning: "#D4A033",
        success: "#75D97A",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#EDEDED",
            secondary: "#C2C2C2",
            accent: "#B191A3",
            disabled: "#8A5660",
        },
    },
};
