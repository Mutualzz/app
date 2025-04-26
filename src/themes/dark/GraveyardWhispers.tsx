import type { Theme } from "@ui/types";

import { baseDarkTheme } from "@ui/themes/baseDark";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyardWhispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#605D60",
        neutral: "#7B4B53",
        background: "#0D0D0D",
        surface: "#1A1A1A",
        danger: "#8F3A42",
        warning: "#D4A033",
        info: "#88A2B2",
        success: "#6FD36F",
        typography: {
            primary: "#D1D1D1",
            neutral: "#939393",
            accent: "#8A6772",
        },
    },
};
