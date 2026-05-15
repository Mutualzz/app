import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const violetNocturneTheme: Theme = {
    ...baseLightTheme,
    id: "violetNocturne",
    name: "Violet Nocturne",
    description: "Gothic violet gradient backgrounds with soft transitions.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background:
            "linear-gradient(90deg,#F2F4FB 0%,#E9ECFB 45%,#D0D5F8 75%,#827BEF 100%,#A06DDF 100%)",
        surface:
            "linear-gradient(90deg,#E9EAF7 0%,#D6D9F6 45%,#B7BFF3 75%,#7E78F0 100%,#A06DDF 100%)",
        danger: "#B3261E",
        warning: "#B15A14",
        success: "#2F7A54",
        info: "#A06DDF",
    },
    typography: {
        ...baseLightTheme.typography,
        colors: {
            primary: "#1A1A1A",
            secondary: "#3A3A3A",
            accent: "#5C6FE6",
            muted: "#5A5A5F",
        },
    },
};
