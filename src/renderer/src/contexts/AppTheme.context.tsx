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
  const isUpdatingFromServer = useRef(false);

  useEffect(() => {
    void loadDefaultAppFonts();
  }, []);

  useEffect(() => {
    const dispose = reaction(
      () => ({
        userThemeRemote: app.settings?.currentTheme,
        userIconRemote: app.settings?.currentIcon
      }),
      ({ userThemeRemote, userIconRemote }) => {
        const themes = app.themes.all;

        if (userIconRemote !== app.themes.currentIcon)
          app.themes.setCurrentIcon(userIconRemote ?? null);

        const pick = (id?: string | null) => {
          const pickedTheme = themes.find((t) => t.id === id);
          if (!pickedTheme) return undefined;
          return { theme: Theme.toEmotion(pickedTheme), authorId: pickedTheme.authorId };
        };

        const selected = pick(userThemeRemote) || pick(app.themes.currentTheme);

        if (!selected) return;

        if (selected.theme.id === themeProviderRef.current?.theme.id) return;

        const primaryFont = extractPrimaryFontFamily(
          selected.theme.typography.fontFamily
        );
        void ensureAppFont(
          primaryFont ?? selected.theme.typography.fontFamily,
          selected.authorId ?? app.account?.id,
        ).finally(() => {
          isUpdatingFromServer.current = true;
          themeProviderRef.current?.changeTheme(selected.theme);
          isUpdatingFromServer.current = false;
          app.themes.setCurrentTheme(selected.theme.id);
        });
      },
      { fireImmediately: true }
    );

    return dispose;
  }, [prefersDark]);

  return <ThemeProvider ref={themeProviderRef}>{children}</ThemeProvider>;
});
