import { useAppStore } from "@hooks/useStores";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { getAdaptiveIcon } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, useState, type HTMLAttributes } from "react";

export const Logo = observer((props: HTMLAttributes<HTMLImageElement>) => {
    const app = useAppStore();
    const { theme } = useTheme();

    const [icon, setIcon] = useState<string | null>(null);

    useEffect(() => {
        const setupAdaptive = async () => {
            const themeToUse = app.themes.currentIcon
                ? Theme.toEmotionTheme(app.themes.get(app.themes.currentIcon))
                : theme;

            const icon = (await getAdaptiveIcon(
                themeToUse,
                "baseUrl",
            )) as string;
            setIcon(icon);
        };

        setupAdaptive();
    }, [app.themes.currentIcon, theme.id, theme.type]);

    return <img alt="" src={icon ?? "/icon.png"} {...props} />;
});
