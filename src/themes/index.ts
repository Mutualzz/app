import { baseTheme } from "./base";
import { darkThemes, type DarkTheme } from "./dark";

export const themes = {
    base: baseTheme,
    ...darkThemes,
};

export type ThemeName = "base" | DarkTheme;
