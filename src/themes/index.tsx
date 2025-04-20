import { darkThemes, type DarkTheme } from "./dark";
import { lightThemes, type LightTheme } from "./light";

export const themes = {
    ...darkThemes,
    ...lightThemes,
};

export type ThemeName = DarkTheme | LightTheme;
