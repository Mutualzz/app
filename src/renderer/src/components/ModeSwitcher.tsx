import { useAppStore } from "@hooks/useStores";
import { useTheme } from "@mutualzz/ui-web";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { switchMode } from "@utils/index";
import { observer } from "mobx-react-lite";
import { AnimatePresence } from "motion/react";
import { AnimatedIconButton } from "./Animated/AnimatedIconButton";
import { PlanetIcon, ScribbleIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useTranslation } from "react-i18next";

const EDITOR_ROUTES = new Set(["/profile", "/avatar"]);

export const ModeSwitcher = observer(() => {
  const { t } = useTranslation("chat");
  const { t: tSpace } = useTranslation("space");
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const targetMode = app.targetMode;
  const hideForEditor = EDITOR_ROUTES.has(pathname);

  const title = t("feed.sidebar.switchMode", {
    mode: targetMode === "feed" ? t("feed.title") : tSpace("sidebar.spaces")
  });

  const handleClick = () => {
    switchMode(app, navigate);
  };

  if (app.isAppLoading) return null;

  const shouldLift = app.composerVisible;

  const bottomOffset = shouldLift ? 84 : 24;

  return (
    <AnimatePresence>
      {!app.hideSwitcher && !hideForEditor && (
        <Tooltip
          placement="left"
          paperProps={{
            elevation: app.settings?.preferEmbossed ? 5 : 1,
            p: 1
          }}
          typographyProps={{
            level: "body-sm"
          }}
          content={title}
        >
          <AnimatedIconButton
            css={{
              position: "fixed",
              bottom: bottomOffset,
              right: 24,
              borderRadius: 9999,
              zIndex: theme.zIndex.fab
            }}
            color="primary"
            size={30}
            variant="solid"
            onClick={handleClick}
            aria-label={title}
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 0.9 }}
            animate={{ scale: [1, 1.15, 1], opacity: 1 }}
            transition={{
              scale: {
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              },
              opacity: {
                duration: 0.4,
                ease: "easeOut"
              }
            }}
          >
            {targetMode === "feed" ? (
              <ScribbleIcon />
            ) : (
              <PlanetIcon weight="fill" />
            )}
          </AnimatedIconButton>
        </Tooltip>
      )}
    </AnimatePresence>
  );
});
