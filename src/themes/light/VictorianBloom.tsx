import type { Theme } from "@mutualzz/ui";
import { baseLightTheme } from "@mutualzz/ui";

export const victorianBloomTheme: Theme = {
    ...baseLightTheme,
    id: "victorianBloom",
    name: "Victorian Bloom",
    description: "Dark Floral Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A6844F",
        neutral: "#5A4A69",
        background: "#EBE8E6",
        surface: "#F6F4F3",
        danger: "#783937",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#486A8F",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#222222",
            secondary: "#444444",
            accent: "#A6844F",
            disabled: "#7B6A6A",
        },
    },
};
