import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { extractPrimaryFontFamily } from "@mutualzz/ui-core";
import {
  ThemeProvider,
  type ThemeProviderRef,
  UiLabelsProvider
} from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { ensureAppFont } from "@utils/fonts/appFontLoader";
import { loadDefaultAppFonts } from "@utils/fonts/loadDefaultAppFonts";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

const fontWaitLimitMs = 150;

export const AppTheme = observer(({ children }: PropsWithChildren) => {
  const app = useAppStore();
  const themeProviderRef = useRef<ThemeProviderRef>(null);
  const prefersDark = usePrefersDark();
  const { t } = useTranslation("common");

  const uiLabels = useMemo(
    () => ({
      closeModal: t("a11y.closeModal"),
      increment: t("a11y.increment"),
      decrement: t("a11y.decrement"),
      showPassword: t("a11y.showPassword"),
      selectPlaceholder: t("select.placeholder")
    }),
    [t]
  );

  useEffect(() => {
    void loadDefaultAppFonts();
  }, []);

  useEffect(() => {
    let themeRequest = 0;

    const dispose = reaction(
      () => ({
        userTheme: app.settings?.currentTheme,
        userIcon: app.settings?.currentIcon,
        spaceThemeId: app.spaces.active?.themeId
      }),
      ({ userTheme, userIcon, spaceThemeId }) => {
        const request = ++themeRequest;
        const themes = app.themes.all;

        if (userIcon !== app.themes.currentIcon)
          app.themes.setCurrentIcon(userIcon ?? null);

        const pick = (id?: string | null) => {
          const pickedTheme = themes.find((t) => t.id === id);
          if (!pickedTheme) return undefined;
          return {
            theme: Theme.toEmotion(pickedTheme),
            authorId: pickedTheme.authorId
          };
        };

        const selected = spaceThemeId
          ? pick(spaceThemeId) || pick(userTheme)
          : pick(userTheme);

        if (!selected) {
          if (themeProviderRef.current?.type !== null) {
            themeProviderRef.current?.changeTheme(null);
          }
          return;
        }

        if (selected.theme.id === themeProviderRef.current?.theme.id) return;

        const primaryFont = extractPrimaryFontFamily(
          selected.theme.typography.fontFamily
        );
        const fontLoad = ensureAppFont(
          primaryFont ?? selected.theme.typography.fontFamily,
          selected.authorId ?? app.account?.id
        ).catch(() => {
          return;
        });
        const fontWaitLimit = new Promise<void>((resolve) =>
          setTimeout(resolve, fontWaitLimitMs)
        );

        void Promise.race([fontLoad, fontWaitLimit]).then(() => {
          if (request !== themeRequest) return;

          themeProviderRef.current?.changeTheme(selected.theme);
        });
      },
      { fireImmediately: true }
    );

    return () => {
      themeRequest++;
      dispose();
    };
  }, [app, prefersDark]);

  return (
    <ThemeProvider ref={themeProviderRef}>
      <UiLabelsProvider labels={uiLabels}>{children}</UiLabelsProvider>
    </ThemeProvider>
  );
});
