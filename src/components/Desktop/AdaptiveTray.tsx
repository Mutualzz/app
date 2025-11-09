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
            const themeToUse = app.theme.currentIcon
                ? Theme.toEmotionTheme(app.theme.get(app.theme.currentIcon))
                : theme;

            await getTray(themeToUse);
            if (!mounted) return;
        })();
        return () => {
            mounted = false;
        };
    }, [theme, app.theme.currentIcon]);
    return null;
});
