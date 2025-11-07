import type { Theme as MzTheme } from "@emotion/react";
import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { baseDarkTheme, baseLightTheme } from "@mutualzz/ui-core";
import { ThemeProvider, type ThemeProviderRef } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useRef, type PropsWithChildren } from "react";

export const AppTheme = observer(({ children }: PropsWithChildren) => {
    const app = useAppStore();
    const themeProviderRef = useRef<ThemeProviderRef>(null);
    const prefersDark = usePrefersDark();

    const applyingRef = useRef(false);
    const lastAppliedRef = useRef<{
        type: typeof app.theme.currentType | null;
        themeId: string | null;
    }>({
        type: null,
        themeId: null,
    });

    useEffect(() => {
        const dispose = reaction(
            () => ({
                theme: app.theme.currentTheme,
                type: app.theme.currentType,
                style: app.theme.currentStyle,
                userThemeRemote: app.account?.settings.currentTheme,
                isLoggedIn: app.token,
            }),
            ({ theme, type, userThemeRemote, isLoggedIn }) => {
                let selectedTheme: MzTheme | undefined;

                const themes = Array.from(app.theme.themes.values());

                // Only proceed if themes are loaded
                if (type === "system") {
                    selectedTheme = prefersDark
                        ? baseDarkTheme
                        : baseLightTheme;
                } else if (isLoggedIn) {
                    const pick = (id?: string | null) => {
                        const pickenTheme = themes.find((t) => t.id === id);
                        if (!pickenTheme) return undefined;
                        return Theme.toEmotionTheme(pickenTheme);
                    };

                    selectedTheme = pick(theme) || pick(userThemeRemote);
                } else {
                    selectedTheme =
                        type === "dark" ? baseDarkTheme : baseLightTheme;
                }

                if (!selectedTheme) return;

                const needType = lastAppliedRef.current.type !== type;
                const needTheme =
                    lastAppliedRef.current.themeId !== selectedTheme.id;

                if (!needType && !needTheme) return;

                applyingRef.current = true;
                try {
                    if (needType) {
                        themeProviderRef.current?.changeType(type);
                        lastAppliedRef.current.type = type;
                    }
                    if (needTheme) {
                        themeProviderRef.current?.changeTheme(selectedTheme);
                        lastAppliedRef.current.themeId =
                            selectedTheme.id ?? null;
                    }
                } finally {
                    // Defer clearing to ensure provider callbacks fire first
                    setTimeout(() => {
                        applyingRef.current = false;
                    }, 0);
                }
            },
        );

        return dispose;
    }, [prefersDark]);

    return (
        <ThemeProvider
            ref={themeProviderRef}
            onThemeChange={(theme) => {
                if (theme.id !== app.theme.currentTheme)
                    app.theme.setCurrentTheme(theme.id);
            }}
            onTypeChange={(type) => {
                if (type !== app.theme.currentType)
                    app.theme.setCurrentType(type);
            }}
            onStyleChange={(style) => {
                if (style !== app.theme.currentStyle)
                    app.theme.setCurrentStyle(style);
            }}
        >
            {children}
        </ThemeProvider>
    );
});
