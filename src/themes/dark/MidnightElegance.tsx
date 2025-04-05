import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const midghtEleganceTheme: Theme = {
    ...baseDarkTheme,
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    colors: {
        primary: "#4C1C24",
        secondary: "#2E2B3A",
        background: "#0A0A0A",
        surface: "#161616",
        typography: {
            primary: "#E5E5E5",
            secondary: "#A09EA6",
            accent: "#783937",
        },
    },
};
