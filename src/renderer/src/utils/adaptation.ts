import type { APITheme } from "@mutualzz/types";
import {
  adaptColors as adaptColorsBase,
  applyAdaptiveThemeValues as applyAdaptiveThemeValuesBase,
} from "@mutualzz/client";

type AdaptInput = Omit<Parameters<typeof adaptColorsBase>[0], "prefersDark">;

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const adaptColors = (input: AdaptInput) =>
  adaptColorsBase({ ...input, prefersDark: prefersDark() });

export const applyAdaptiveThemeValues = (values: APITheme) =>
  applyAdaptiveThemeValuesBase(values, prefersDark());
