import { useAppStore } from "@hooks/useStores";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAdaptiveIcon } from "@utils/index";
import { observer } from "mobx-react";
import { useLayoutEffect } from "react";

export const AdaptiveIcon = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const appWindow = getCurrentWindow();

    useLayoutEffect(() => {
        (async () => {
            try {
                const themeToUse = app.theme.currentIcon
                    ? Theme.toEmotionTheme(app.theme.get(app.theme.currentIcon))
                    : theme;

                const icon = await getAdaptiveIcon(themeToUse);

                await appWindow.setIcon(icon);
            } catch (e) {
                console.error("Failed to load window icon:", e);
            }
        })();
    }, [theme.id, theme.type, app.theme.currentIcon]);

    return null;
});
