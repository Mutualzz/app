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
        primary: "#684292",
        neutral: "#8E5C68",
        background: "#0A080A",
        surface: "#18121D",
        danger: "#9A477F",
        warning: "#D4A033",
        success: "#72D372",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#ECECEC",
            secondary: "#CAB8D8",
            accent: "#A479D0",
            disabled: "#7A668A",
        },
    },
};
