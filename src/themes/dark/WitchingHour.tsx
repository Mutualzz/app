import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const witchingHourTheme: Theme = {
    ...baseDarkTheme,
    name: "Witching Hour",
    description: "Mystical, Arcane, and Enigmatic",
    colors: {
        primary: "#3F2841",
        secondary: "#2B2B4F",
        background: "#0A0A12",
        surface: "#151526",
        typography: {
            primary: "#EAE5E5",
            secondary: "#8C7C96",
            accent: "#AD60A1",
        },
    },
};
