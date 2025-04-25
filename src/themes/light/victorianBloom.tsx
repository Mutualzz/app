import { baseLightTheme } from "@mutualzz/ui/themes/baseLight";
import type { Theme } from "@mutualzz/ui/types";

export const victorianBloomTheme: Theme = {
    ...baseLightTheme,
    id: "victorianBloom",
    name: "Victorian Bloom",
    description: "Dark Floral Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#A6844F",
        neutral: "#5A4A69",
        background: "#EBE8E6",
        surface: "#F9F9F9",
        danger: "#783937",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
