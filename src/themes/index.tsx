import type { Theme } from "@emotion/react";
import { darkThemesObj, type DarkTheme } from "./dark";

export type Themes = DarkTheme;

export const themesObj: Record<DarkTheme, Theme> = {
    ...darkThemesObj,
};

export const themeNames = Object.keys(themesObj) as Themes[];
export const themes = Object.values(themesObj);
