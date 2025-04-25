import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const victorianBloomTheme: Theme = {
    ...baseLightTheme,
    id: "victorianBloom",
    name: "Victorian Bloom",
    description: "Dark Floral Light",
    type: "light",
    colors: {
        ...baseLightTheme.colors,
        common: { white: "#FFFFFF", black: "#121212" },
        primary: "#C2A05E",
        neutral: "#5A4A69",
        background: "#F4F2F0",
        surface: "#FFFFFF",
        danger: "#783937",
        warning: "#D4A033",
        success: "#6FD36F",
        info: "#607D8B",
    },
};
