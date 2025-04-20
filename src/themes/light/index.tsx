import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const lightThemes: Record<LightTheme, Theme> = {
    baseLight: baseLightTheme,
};

export const themeNames = Object.keys(lightThemes) as LightTheme[];
export const themeValues = Object.values(lightThemes);

export type LightTheme = "baseLight";
