import {
  ThemeProvider as EmotionThemeProvider,
  type Theme as MzTheme
} from "@emotion/react";
import type { APIDisplayNameStyle, APIProfileTheme } from "@mutualzz/types";
import { themeToCssVars } from "@mutualzz/ui-core";
import { ThemeContext, useTheme } from "@mutualzz/ui-web";
import { useMemo, type PropsWithChildren } from "react";
import {
  ProfileNameStyleContext,
  toProfileEmotionTheme
} from "./profileTheme.utils";

export const useProfileScopedTheme = (
  profileTheme: APIProfileTheme | null | undefined
) =>
  useMemo(
    () => (profileTheme ? toProfileEmotionTheme(profileTheme) : null),
    [profileTheme]
  );

export const getScopedThemeCss = (scopedTheme: MzTheme | null) =>
  scopedTheme
    ? {
        ...themeToCssVars(scopedTheme),
        color: scopedTheme.typography.colors.primary
      }
    : undefined;

interface Props extends PropsWithChildren {
  scopedTheme: MzTheme | null;
  displayNameStyle?: APIDisplayNameStyle | null;
}

export const ProfileThemeScope = ({
  scopedTheme,
  displayNameStyle,
  children
}: Props) => {
  const themeContext = useTheme();

  const scopedContext = useMemo(
    () =>
      scopedTheme
        ? { ...themeContext, theme: scopedTheme, type: scopedTheme.type }
        : themeContext,
    [scopedTheme, themeContext]
  );

  return (
    <ThemeContext.Provider value={scopedContext}>
      <EmotionThemeProvider theme={scopedTheme ?? themeContext.theme}>
        <ProfileNameStyleContext.Provider value={displayNameStyle ?? null}>
          {children}
        </ProfileNameStyleContext.Provider>
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};
