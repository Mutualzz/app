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
        let isInitialLoad = true;

        const modeDispose = reaction(
            () => themeStore.currentMode,
            (mode) => {
                themeProviderRef?.current?.changeMode(mode);

                if (!isInitialLoad) {
                    const defaulTheme =
                        mode === "dark" ? baseDarkTheme : baseLightTheme;
                    themeProviderRef.current?.changeTheme(defaulTheme);
                    themeStore.setCurrentTheme(defaulTheme.id);
                }

                isInitialLoad = false;
            },

            { fireImmediately: true },
        );

        const themeDispose = reaction(
            () => ({
                storeTheme: themeStore.currentTheme,
                userTheme: account?.settings.currentTheme,
            }),
            ({ storeTheme, userTheme }) => {
                let themeToUse = null;

                if (userTheme) {
                    themeToUse = themeStore.themes.find(
                        (theme) => theme.id === userTheme.id,
                    );
                } else if (storeTheme) {
                    themeToUse = storeTheme;
                }

                if (themeToUse) {
                    themeProviderRef.current?.changeTheme(themeToUse);
                } else {
                    const defaultTheme =
                        themeStore.currentMode === "dark"
                            ? baseDarkTheme
                            : baseLightTheme;
                    themeProviderRef.current?.changeTheme(defaultTheme);
                }
            },
            { fireImmediately: true },
        );

        return () => {
            modeDispose();
            themeDispose();
        };
    }, []);

    return (
        <ThemeProvider
            ref={themeProviderRef}
            onThemeChange={(theme) => {
                if (theme.id !== themeStore.currentTheme?.id) {
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
