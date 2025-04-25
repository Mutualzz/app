import type { Theme, Themes } from "@mutualzz/ui/types";
import { darkThemesObj } from "./dark";
import { lightThemesObj } from "./light";

export const themesObj: Record<Themes, Theme> = {
    ...darkThemesObj,
    ...lightThemesObj,
};

export const themes = Object.values(themesObj);
