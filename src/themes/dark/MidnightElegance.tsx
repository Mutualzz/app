import type { Theme } from "@ui/types";

import { baseDarkTheme } from "@ui/themes/baseDark";

export const midghtEleganceTheme: Theme = {
    ...baseDarkTheme,
    id: "midnightElegance",
    name: "Midnight Elegance",
    description: "Dark Victorian Vibes",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#4B4E72",
        neutral: "#5A4A69",
        background: "#0A0A0A",
        surface: "#161616",
        danger: "#783937",
        warning: "#D4A033",
        info: "#607D8B",
        success: "#6FD36F",
    },
};
