import type { Theme } from "../types";
import { baseDarkTheme } from "./baseDark";
import { baseLightTheme } from "./baseLight";

export type DefaultThemes = "baseDark" | "baseLight";

export const defaultThemes: Record<DefaultThemes, Theme> = {
    baseDark: baseDarkTheme,
    baseLight: baseLightTheme,
};

export const themes = Object.values(defaultThemes);
