import { usePrefersDark } from "@hooks/usePrefersDark";
import { useAppStore } from "@hooks/useStores";
import { ThemeProvider, type ThemeProviderRef } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { type PropsWithChildren, useEffect, useRef } from "react";

export const AppTheme = observer(({ children }: PropsWithChildren) => {
    const app = useAppStore();
    const themeProviderRef = useRef<ThemeProviderRef>(null);
    const prefersDark = usePrefersDark();
    const isUpdatingFromServer = useRef(false);

    useEffect(() => {
        const dispose = reaction(
            () => ({
                userThemeRemote: app.settings?.currentTheme,
                userIconRemote: app.settings?.currentIcon,
            }),
            ({ userThemeRemote, userIconRemote }) => {
                const themes = app.themes.all;

                if (userIconRemote !== app.themes.currentIcon) {
                    app.themes.setCurrentIcon(userIconRemote ?? null);
                }

                // Check if themes are loaded
                const pick = (id?: string | null) => {
                    const pickedTheme = themes.find((t) => t.id === id);
                    if (!pickedTheme) return undefined;
                    return Theme.toEmotion(pickedTheme);
                };

                const selectedTheme =
                    pick(userThemeRemote) || pick(app.themes.currentTheme);

                if (!selectedTheme) return;

                if (selectedTheme.id === themeProviderRef.current?.theme.id)
                    return;

                isUpdatingFromServer.current = true;
                themeProviderRef.current?.changeTheme(selectedTheme);
                isUpdatingFromServer.current = false;
                app.themes.setCurrentTheme(selectedTheme.id);
            },
            { fireImmediately: true },
        );

        return dispose;
    }, [prefersDark]);

    return <ThemeProvider ref={themeProviderRef}>{children}</ThemeProvider>;
});
