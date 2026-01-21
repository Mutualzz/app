import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getAdaptiveIcon } from "@utils/icons";
import { getTray } from "@utils/tray";
import { observer } from "mobx-react-lite";
import { useLayoutEffect } from "react";

const logger = new Logger({
    tag: "AdaptiveElements",
});

export const AdaptiveElements = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const appWindow = getCurrentWindow();

    useLayoutEffect(() => {
        (async () => {
            try {
                const themeToUse = app.themes.currentIcon
                    ? Theme.toEmotion(app.themes.get(app.themes.currentIcon))
                    : theme;

                const icon = await getAdaptiveIcon(
                    themeToUse,
                    "automatic",
                    "image/png",
                );

                await appWindow.setIcon(icon);
                await getTray(themeToUse);
            } catch (e) {
                logger.error("Failed to load window icon:", e);
            }
        })();
    }, [theme.id, theme.type, app.themes.currentIcon]);

    return null;
});
