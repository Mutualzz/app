import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const silverDawnTheme: Theme = {
    ...baseLightTheme,
    id: "silverDawn",
    name: "Silver Dawn",
    description: "Cool metallic gradients evoking early morning steel.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#AEB6CF",
        neutral: "#8C9BAA",
        background:
            "linear-gradient(90deg,#F4F7F8 0%,#EAF0F2 45%,#D8E6E6 75%,#86B39E 100%,#AEB6CF 100%)",
        surface:
            "linear-gradient(90deg,#EEF3F3 0%,#DCE9E7 45%,#B6D6CB 75%,#86B39E 100%,#AEB6CF 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#AEB6CF",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#AEB6CF",
            muted: "#5A5A5F",
        },
    },
};
