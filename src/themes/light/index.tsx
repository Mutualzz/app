import type { Theme } from "@emotion/react";
import { baseLightTheme } from "./baseLight";

export const lightThemesObj: Record<LightTheme, Theme> = {
    baseLight: baseLightTheme,
};

export const lightThemes = Object.values(lightThemesObj);

export type LightTheme = "baseLight";
