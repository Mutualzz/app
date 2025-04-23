import type { Theme } from "@emotion/react";
import { darkThemesObj, type DarkTheme } from "./dark";
import { lightThemesObj, type LightTheme } from "./light";

export type Themes = DarkTheme | LightTheme;

export const themesObj: Record<Themes, Theme> = {
    ...darkThemesObj,
    ...lightThemesObj,
};

export const themes = Object.values(themesObj);
