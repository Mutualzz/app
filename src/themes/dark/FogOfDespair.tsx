import type { Theme } from "@mutualzz/ui";
import { baseDarkTheme } from "@mutualzz/ui";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fogOfDespair",
    name: "Fog of Despair",
    description: "Cold, Distant, and Ethereal",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#688BA0",
        neutral: "#8EA0AA",
        background: "#0B0D10",
        surface: "#192028",
        danger: "#9F477F",
        warning: "#D4A033",
        success: "#75D97A",
        info: "#486A8F",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F0F0F0",
            secondary: "#BFD0D9",
            accent: "#AAC4D1",
            disabled: "#8EA0AA",
        },
    },
};
