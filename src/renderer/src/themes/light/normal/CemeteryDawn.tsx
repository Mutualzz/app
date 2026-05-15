import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const cemeteryDawnTheme: Theme = {
    ...baseLightTheme,
    id: "cemeteryDawn",
    name: "Cemetery Dawn",
    description: "Muted dawn mist with warm gray undertones.",
    adaptive: false,
    style: "normal",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A88082",
        neutral: "#A89A9A",
        background: "#FBFBFC",
        surface: "#ECE9EE",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#B37E80",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#664444",
            muted: "#5A5A5F",
        },
    },
};
