import { useAppStore } from "@hooks/useStores";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { getTray } from "@utils/tray";
import { observer } from "mobx-react";
import { useEffect } from "react";

export const AdaptiveTray = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();

    useEffect(() => {
        let mounted = true;
        (async () => {
            const themeToUse = app.themes.currentIcon
                ? Theme.toEmotionTheme(app.themes.get(app.themes.currentIcon))
                : theme;

            await getTray(themeToUse);
            if (!mounted) return;
        })();
        return () => {
            mounted = false;
        };
    }, [theme, app.themes.currentIcon]);
    return null;
});
