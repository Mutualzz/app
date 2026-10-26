import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { extractPrimaryFontFamily } from "@mutualzz/ui-core";
import { ThemeProvider, type ThemeProviderRef } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { ensureAppFont } from "@utils/fonts/appFontLoader";
import { loadDefaultAppFonts } from "@utils/fonts/loadDefaultAppFonts";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useEffect, useRef } from "react";

export const AppTheme = observer(({ children }: PropsWithChildren) => {
  const app = useAppStore();
  const themeProviderRef = useRef<ThemeProviderRef>(null);
  const prefersDark = usePrefersDark();
  const isUpadingFromServer = useRef(false);

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
        void ensureAppFont(
          primaryFont ?? selected.theme.typography.fontFamily,
          selected.authorId ?? app.account?.id
        )
          .catch(() => {
            return;
          })
          .finally(() => {
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

  return <ThemeProvider ref={themeProviderRef}>{children}</ThemeProvider>;
});
