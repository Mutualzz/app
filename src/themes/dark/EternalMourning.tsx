import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternal-mourning",
    name: "Eternal Mourning",
    description: "Melancholiic & Gothic Elegance",
    colors: {
        primary: "#2E2A4A",
        secondary: "#4C3A54",
        background: "#0A080A",
        surface: "#151218",
        typography: {
            primary: "#E5E3E8",
            secondary: "#938B96",
            accent: "#9A1F6A",
        },
    },
};
