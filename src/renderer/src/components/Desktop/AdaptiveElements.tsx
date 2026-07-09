import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import {
  extractColors,
  formatColor,
  isValidGradient,
  type ColorLike
} from "@mutualzz/ui-core";
import { useTheme } from "@mutualzz/ui-web";
import { Theme } from "@stores/objects/Theme";
import { updateTrayProperties } from "@utils/tray";
import { observer } from "mobx-react-lite";
import { useLayoutEffect } from "react";

const logger = new Logger({ tag: "AdaptiveElements" });

function toSolidHex(color: ColorLike): string {
  const resolved = isValidGradient(color)
    ? (extractColors(color)?.[0] ?? color)
    : color;

  return formatColor(resolved, { format: "hex" }) as string;
}

export const AdaptiveElements = observer(() => {
  const app = useAppStore();
  const { theme } = useTheme();

  useLayoutEffect(() => {
    (async () => {
      try {
        const themeToUse = app.themes.currentIcon
          ? Theme.toEmotion(app.themes.get(app.themes.currentIcon))
          : theme;

        await updateTrayProperties(themeToUse);
      } catch (e) {
        logger.error("Failed to load window icon:", e);
      }
    })();
  }, [theme.id, theme.type, app.themes.currentIcon]);

  useLayoutEffect(() => {
    try {
      app.setBadgeColor(toSolidHex(theme.colors.danger));
    } catch (e) {
      logger.error("Failed to resolve badge color:", e);
    }
  }, [theme.colors.danger]);

  return null;
});
