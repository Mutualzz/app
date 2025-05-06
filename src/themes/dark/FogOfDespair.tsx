import { baseDarkTheme } from "@ui/themes/baseDark";
import type { Theme } from "@ui/types";

export const fogOfDespairTheme: Theme = {
    ...baseDarkTheme,
    id: "fogOfDespair",
    name: "Fog of Despair",
    description: "Cold, Distant, and Ethereal",
    type: "dark",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#5D7688",
        neutral: "#7D8F99",
        background: "#0B0D10",
        surface: "#171C24",
        danger: "#8F3C74",
        warning: "#D4A033",
        info: "#88A2B2",
        success: "#6FD36F",
    },
};
