import type { Theme } from "@ui/types";
import { darkThemesObj } from "./dark";
import { lightThemesObj } from "./light";

export const themesObj: Record<string, Theme> = {
    ...darkThemesObj,
    ...lightThemesObj,
};

export const themes = Object.values(themesObj);
