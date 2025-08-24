import { StatusBar } from "@capacitor/status-bar";
import {
    dynamicElevation,
    extractGradientStops,
    isValidGradient,
    useTheme,
} from "@mutualzz/ui";
import { isMobile } from "@utils/index";
import { formatHex } from "culori";
import { useEffect } from "react";

export const AdaptStatusBar = () => {
    const { theme } = useTheme();

    useEffect(() => {
        const { surface } = theme.colors;
        const elevatedSurface = dynamicElevation(surface, 2);
        const hexSurface = isValidGradient(elevatedSurface)
            ? (() => {
                  const extracted = extractGradientStops(elevatedSurface);
                  return extracted[0];
              })()
            : formatHex(elevatedSurface);

        if (!hexSurface) return;

        StatusBar.setBackgroundColor({
            color: hexSurface,
        });
    }, [theme, isMobile]);

    return null;
};
