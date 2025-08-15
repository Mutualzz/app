import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import {
    baseDarkTheme,
    baseLightTheme,
    ThemeProvider,
    type ThemeProviderRef,
} from "@mutualzz/ui";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useRef, type PropsWithChildren } from "react";
export const AppTheme = observer(({ children }: PropsWithChildren) => {
    const app = useAppStore();
    const { theme: themeStore, account } = app;
    const themeProviderRef = useRef<ThemeProviderRef>(null);

    useEffect(() => {
        const dispose = reaction(
            () => ({
                storeTheme: themeStore.currentTheme,
                userTheme: account?.settings.currentTheme,
                mode: themeStore.currentMode,
                length: themeStore.themes.length,
            }),
            ({ storeTheme, userTheme, mode }) => {
                themeProviderRef?.current?.changeMode(mode);
                const prefersDark = usePrefersDark();
                if (mode === "system") {
                    themeProviderRef?.current?.changeTheme(
                        prefersDark ? baseDarkTheme : baseLightTheme,
                    );
                    return;
                }

                const themeId = userTheme?.id ?? storeTheme;
                const theme = themeStore.themes.find((t) => t.id === themeId);
                if (theme) themeProviderRef?.current?.changeTheme(theme);
            },
            { fireImmediately: true },
        );

        return dispose;
    }, []);

    return (
        <ThemeProvider
            ref={themeProviderRef}
            onThemeChange={(theme) => {
                if (theme.id !== themeStore.currentTheme) {
                    themeStore.setCurrentTheme(theme.id);
                }
            }}
            onModeChange={(mode) => {
                if (mode !== themeStore.currentMode) {
                    themeStore.setCurrentMode(mode);
                }
            }}
        >
            {children}
        </ThemeProvider>
    );
});
