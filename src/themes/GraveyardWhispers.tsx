import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const graveyardWhispersTheme: Theme = {
    ...baseDarkTheme,
    id: "graveyard-whispers",
    name: "Graveyard Whispers",
    description: "Muted, Eerie, and Cold",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#2E4057",
        secondary: "#4B2E39",
        background: "#0D0D0D",
        surface: "#1A1A1A",

        typography: {
            primary: "#D1D1D1",
            secondary: "#939393",
            accent: "#8F3A42",
        },
    },
};
