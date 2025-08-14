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
    const { theme: themeStore } = app;
    const themeProviderRef = useRef<ThemeProviderRef>(null);

    useEffect(() => {
        const modeDispose = reaction(
            () => themeStore.currentMode,
            (mode) => {
                themeProviderRef?.current?.changeMode(mode);
            },
            { fireImmediately: true },
        );

        const themeDispose = reaction(
            () => themeStore.currentTheme,
            (theme) => {
                if (theme) {
                    themeProviderRef.current?.changeTheme(theme);
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
