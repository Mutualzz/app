import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const vintageSorrowTheme: Theme = {
    ...baseDarkTheme,
    id: "vintageSorrow",
    name: "Vintage Sorrow",
    description:
        "Dramatic vintage gradients with melancholic rose transitions.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#F48CA7",
        neutral: "#CDAFB9",
        background:
            "linear-gradient(90deg,#070609 0%,#181014 40%,#2C1720 70%,#7A3A4B 100%)",
        surface:
            "linear-gradient(90deg,#19161A 0%,#20161A 40%,#3C2430 80%,#F48CA7 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#FF95AB",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#E1B7C8",
            accent: "#F48CA7",
            muted: "#A88B97",
        },
    },
};
