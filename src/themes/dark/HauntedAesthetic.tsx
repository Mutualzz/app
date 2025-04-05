import { Theme } from "@emotion/react";
import { baseDarkTheme } from "./baseDark";

export const hauntedAestheticTheme: Theme = {
    ...baseDarkTheme,
    id: "haunted-aesthetic",
    name: "Haunted Aesthetic",
    description: "Ethereal, Erie, and Softly Dark",
    colors: {
        primary: "#3B3F58",
        secondary: "#5B2C47",
        background: "#0C0C0C",
        surface: "#171717",
        typography: {
            primary: "#E0E0E0",
            secondary: "#8A8A8A",
            accent: "#6E4A68",
        },
    },
};
