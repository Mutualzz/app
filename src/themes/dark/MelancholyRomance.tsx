import type { Theme } from "@mutualzz/ui/types";

import { baseDarkTheme } from "@mutualzz/ui/themes/baseDark";

export const melancholyRomanceTheme: Theme = {
    ...baseDarkTheme,
    id: "melancholyRomance",
    name: "Melancholy Romance",
    description: "Dramatic, Vintage, and Elegant",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#93656F",
        neutral: "#73678F",
        background: "#0A0608",
        surface: "#171117",
        danger: "#9C5050",
        warning: "#D4A033",
        info: "#607D8B",
        success: "#4CAF50",
        typography: {
            primary: "#E3E3E3",
            neutral: "#A79D9C",
            accent: "#BA837E",
        },
    },
};
