import { type Theme } from "@emotion/react";

export const baseLightTheme: Theme = {
    id: "baseLight",
    name: "Light",
    description: "Default Light Theme",
    type: "light",
    colors: {
        common: {
            white: "#FFFFFF",
            black: "#000000",
        },

        primary: "#F24C7B", // Keeping the same since it's vibrant enough for light
        neutral: "#5A5A5A", // Neutral is good on light backgrounds too
        background: "#F5F5F5", // Light gray-white background
        surface: "#FAFAFA", // Pure white surface elements (cards, modals)

        danger: "#FF4D4D", // Same, good contrast on light
        warning: "#FFC107", // Same, works fine on light
        success: "#4CAF50", // Still works well on light
        info: "#2196F3", // Safe on light

        typography: {
            primary: "#202020", // Deep gray/near-black for body text
            neutral: "#5A5A5A", // Slightly softer for secondary text
            accent: "#A4243B", // Keeping the same accent (rich red), still readable
        },
    },
    typography: {
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.5,
    },
};
