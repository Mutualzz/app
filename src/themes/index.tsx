import type { Theme } from "@mutualzz/ui";
import { darkThemesObj } from "./dark";
import { lightThemesObj } from "./light";

export const themesObj: Record<string, Theme> = {
    ...darkThemesObj,
    ...lightThemesObj,
};

export const themes = Object.values(themesObj);
