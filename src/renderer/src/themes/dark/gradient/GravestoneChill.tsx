import type { Theme } from "@emotion/react";
import { baseDarkTheme } from "@mutualzz/ui-core";

export const gravestoneChillTheme: Theme = {
    ...baseDarkTheme,
    id: "gravestoneChill",
    name: "Gravestone Chill",
    description: "Muted graveyard gradients with chilly stone tones.",
    adaptive: false,
    type: "dark",
    style: "gradient",
    colors: {
        ...baseDarkTheme.colors,
        primary: "#AEB6CF",
        neutral: "#8C9BAA",
        background:
            "linear-gradient(90deg,#070708 0%,#181A1F 40%,#23262E 70%,#49505E 100%)",
        surface:
            "linear-gradient(90deg,#15161A 0%,#23243A 40%,#384052 80%,#AEB6CF 100%)",
        danger: "#FF5A6B",
        warning: "#F2C572",
        success: "#4DBE9A",
        info: "#7CA7E6",
    },
    typography: {
        ...baseDarkTheme.typography,
        colors: {
            primary: "#F3F6FA",
            secondary: "#C3C9D1",
            accent: "#AEB6CF",
            muted: "#7C8B9C",
        },
    },
};
