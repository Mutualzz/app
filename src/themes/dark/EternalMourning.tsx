import { baseDarkTheme } from "@ui/themes/baseDark";
import type { Theme } from "@ui/types";

export const eternalMourningTheme: Theme = {
    ...baseDarkTheme,
    id: "eternalMourning",
    name: "Eternal Mourning",
    description: "Melancholic & Gothic Elegance",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5C3A82",
        neutral: "#845159",
        background: "#0A080A",
        surface: "#151218",
        danger: "#8F3C74",
        warning: "#D4A033",
        info: "#607D8B",
        success: "#6FD36F",
    },
};
