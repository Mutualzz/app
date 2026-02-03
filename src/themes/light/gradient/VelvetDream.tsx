import type { Theme } from "@emotion/react";
import { baseLightTheme } from "@mutualzz/ui-core";

export const velvetDreamTheme: Theme = {
    ...baseLightTheme,
    id: "velvetDream",
    name: "Velvet Dream",
    description: "Dramatic vintage gradients with rich violet-to-rose fades.",
    adaptive: false,
    type: "light",
    style: "gradient",
    colors: {
        ...baseLightTheme.colors,
        primary: "#A06DDF",
        neutral: "#B3A3D6",
        background:
            "linear-gradient(90deg,#F7F5F7 0%,#F1EDF3 38%,#E3D2E2 65%,#C26B89 100%,#A06DDF 100%)",
        surface:
            "linear-gradient(90deg,#F0E9EE 0%,#E6DAE4 45%,#D0B2C5 75%,#B86F88 92%,#A06DDF 100%)",
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
            accent: "#A06DDF",
            muted: "#5A5A5F",
        },
    },
};
