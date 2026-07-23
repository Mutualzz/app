import { WINDOW_TITLEBAR_ZINDEX } from "@renderer/types";
import { Paper } from "@components/Paper";
import { useDesktopShell } from "@contexts/DesktopShell.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  Box,
  Divider,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  MinusIcon,
  SquareIcon,
  XIcon
} from "@phosphor-icons/react";
import { ThemeCreatorModal } from "./ThemeCreator/ThemeCreatorModal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { IconButton } from "./IconButton";
import { DownloadButton } from "./DownloadButton";
import { useNetworkState } from "@react-hookz/web";
import { Button } from "@components/Button";
import { isElectron } from "@utils/index";
import { Tooltip } from "@components/Tooltip";
import { useWindowTitleBar } from "@contexts/WindowTitleBar.context";
import { NotificationCenterButton } from "@components/NotificationCenter/NotificationCenterButton";
import { TitleBarModeSwitcher } from "@components/Navigation/TitleBarModeSwitcher";

interface WindowTitleBarProps {
  onHeightChange?: (height: number) => void;
}

const WindowTitleBar = ({ onHeightChange }: WindowTitleBarProps) => {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { inPreview, stopPreview, values } = app.themeCreator;
  const { openModal } = useModal();
  const { theme, changeTheme } = useTheme();
  const { os } = useDesktopShell();
  const networkState = useNetworkState();
  const { config: pageTitleBar } = useWindowTitleBar();

  const [closeDanger, setCloseDanger] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isMac = os.platform === "macos";

  const stage = app.updater?.stage;

  const isUpdating = stage === "installing";

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    if (isUpdating) return;
    const el = rootRef.current;
    if (!el) return;

    const setHeight = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      onHeightChange?.(height);
    };

    setHeight();

    const ro = new ResizeObserver(setHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      onHeightChange?.(0);
    };
  }, [isMac, isUpdating, onHeightChange]);

  const handleMinimize = () => {
    window.api?.window.minimize();
  };

  const handleMaximize = () => {
    window.api?.window.maximize();
  };

  const handleClose = () => {
    window.api?.window.close();
  };

  if (isUpdating) return null;

  return (
    <Stack
      width="100%"
      position="fixed"
      css={{ WebkitAppRegion: "drag", userSelect: "none" }}
      ref={rootRef}
      direction="column"
    >
      {!networkState.online && (
        <Paper
          alignItems="center"
          justifyContent="center"
          variant="solid"
          color="danger"
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
        >
          <Typography level="body-lg">
            {tCommon("connection.offlineBanner")}
          </Typography>
        </Paper>
      )}
      {app.voice.disconnectBanner && (
        <Paper
          alignItems="center"
          justifyContent="center"
          variant="solid"
          color="warning"
          spacing={2.5}
          p={1.25}
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
        >
          <Typography level="body-lg">{app.voice.disconnectBanner}</Typography>
          {app.voice.disconnectedFrom && (
            <Button
              variant="outlined"
              size="sm"
              onClick={() => app.voice.join(app.voice.disconnectedFrom!)}
              css={{
                WebkitAppRegion: "no-drag",
                userSelect: "auto"
              }}
            >
              {tCommon("connection.reconnect")}
            </Button>
          )}
          <Box position="absolute" top={2} right={4}>
            <IconButton
              size="sm"
              variant="plain"
              onClick={() => app.voice.clearDisconnectBanner()}
              css={{
                WebkitAppRegion: "no-drag",
                userSelect: "auto"
              }}
            >
              <XIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
      {app.voice.audioPlaybackBlocked && (
        <Paper
          alignItems="center"
          justifyContent="center"
          variant="solid"
          color="warning"
          spacing={2.5}
          p={1.25}
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
        >
          <Typography level="body-lg">
            {tCommon("connection.audioBlocked")}
          </Typography>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => app.voice.retryBlockedAudio()}
            css={{
              WebkitAppRegion: "no-drag",
              userSelect: "auto"
            }}
          >
            {tCommon("connection.enableAudio")}
          </Button>
        </Paper>
      )}
      <Paper
        position="relative"
        css={{ WebkitAppRegion: "drag", userSelect: "none" }}
        justifyContent="space-between"
        alignItems="center"
        p={1.5}
        variant={app.settings?.preferEmbossed ? "elevation" : "plain"}
        transparency={65}
        minHeight={44}
        zIndex={WINDOW_TITLEBAR_ZINDEX}
        top={0}
        left={0}
        elevation={app.settings?.preferEmbossed ? 1 : 0}
        boxShadow="none !important"
      >
        {pageTitleBar && (
          <Stack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            px={1.5}
            css={{
              pointerEvents: "none",
              zIndex: 0
            }}
          >
            <Typography
              fontWeight="bold"
              flexShrink={0}
              css={{
                userSelect: "none",
                WebkitAppRegion: "drag",
                whiteSpace: "nowrap"
              }}
            >
              {pageTitleBar.title}
            </Typography>
            {pageTitleBar.centerExtra && (
              <Stack
                css={{
                  pointerEvents: "auto",
                  WebkitAppRegion: "no-drag",
                  userSelect: "auto"
                }}
              >
                {pageTitleBar.centerExtra}
              </Stack>
            )}
          </Stack>
        )}
        <Stack
          alignItems="center"
          css={{
            WebkitAppRegion: "drag",
            userSelect: "none",
            position: "relative",
            zIndex: 1
          }}
          flex={1}
        >
          {app.account && (
            <Stack
              css={{
                WebkitAppRegion: "drag",
                userSelect: "none"
              }}
              pl={isMac ? 20 : 1.25}
              direction="row"
              alignItems="center"
              spacing={2.5}
            >
              {pageTitleBar?.onBack ? (
                <Button
                  size="sm"
                  color={
                    pageTitleBar.backLabel === tCommon("close")
                      ? "danger"
                      : "neutral"
                  }
                  variant="soft"
                  startDecorator={<ArrowLeftIcon weight="bold" />}
                  onClick={pageTitleBar.onBack}
                  css={{
                    WebkitAppRegion: "no-drag",
                    userSelect: "auto",
                    flexShrink: 0
                  }}
                >
                  {pageTitleBar.backLabel ?? tCommon("back")}
                </Button>
              ) : (
                <Stack spacing={0.75} alignItems="center" mt={1.75}>
                  <Tooltip content={tCommon("nav.goBack")}>
                    <IconButton
                      disabled={!app.navigation.canBack}
                      onClick={() => app.navigation.back(navigate)}
                      css={{
                        WebkitAppRegion: "no-drag",
                        userSelect: "auto"
                      }}
                      size="sm"
                    >
                      <ArrowLeftIcon weight="fill" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={tCommon("nav.goForward")}>
                    <IconButton
                      disabled={!app.navigation.canForward}
                      onClick={() => app.navigation.forward(navigate)}
                      css={{
                        WebkitAppRegion: "no-drag",
                        userSelect: "auto"
                      }}
                      size="sm"
                    >
                      <ArrowRightIcon weight="fill" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              {inPreview && (
                <Stack spacing={5} alignItems="center">
                  <Typography
                    css={{
                      userSelect: "none"
                    }}
                    fontWeight="bold"
                    ml={2}
                  >
                    {values.name
                      ? t("themeCreator.preview.bannerNamed", {
                          name: values.name
                        })
                      : t("themeCreator.preview.banner")}
                  </Typography>
                  <Button
                    onClick={() => {
                      openModal("theme-creator", <ThemeCreatorModal />);
                      stopPreview(changeTheme);
                    }}
                    variant="solid"
                    color="danger"
                    css={{
                      WebkitAppRegion: "no-drag",
                      userSelect: "auto"
                    }}
                  >
                    {t("themeCreator.preview.stop")}
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          width="100%"
          spacing={1.25}
          css={{
            WebkitAppRegion: "drag",
            userSelect: "none",
            position: "relative",
            zIndex: 1
          }}
          justifyContent="center"
          flex={1}
        >
          {!pageTitleBar && <TitleBarModeSwitcher />}
        </Stack>
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="flex-end"
          spacing={1.25}
          direction="row"
          css={{
            WebkitAppRegion: "drag",
            userSelect: "none",
            position: "relative",
            zIndex: 1
          }}
        >
          {pageTitleBar?.end && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              pr={isMac ? 1 : 0}
              css={{ WebkitAppRegion: "no-drag", userSelect: "auto" }}
            >
              {pageTitleBar.end}
            </Stack>
          )}
          {app.account && (
            <Stack
              alignItems="center"
              css={{ WebkitAppRegion: "no-drag", userSelect: "auto" }}
            >
              <NotificationCenterButton />
            </Stack>
          )}
          {!isMac && isElectron && (
            <Divider
              orientation="vertical"
              css={{ opacity: 0.25 }}
              lineColor="muted"
            />
          )}

          {!isElectron && isAuthPage && (
            <DownloadButton
              css={{
                WebkitAppRegion: "no-drag",
                userSelect: "auto"
              }}
              color="success"
              size="lg"
            />
          )}
          {isElectron && app.updater?.hasUpdate && (
            <Stack px={isMac ? 3.75 : 0} alignItems="center" spacing={2}>
              <IconButton
                onClick={() => {
                  if (app.updater?.stage === "ready") {
                    void app.updater.installUpdate();
                  }
                }}
                size={16}
                variant="plain"
                color="success"
                padding={4}
                title={
                  app.updater.progressLabel ||
                  (app.updater.stage === "ready" ? "Install update" : undefined)
                }
                css={{
                  WebkitAppRegion: "no-drag",
                  opacity: app.updater.stage === "ready" ? 1 : 0.75,
                  pointerEvents:
                    app.updater.stage === "ready" ? "auto" : "none"
                }}
              >
                <DownloadIcon weight="fill" />
              </IconButton>
            </Stack>
          )}
          {!isMac && isElectron && (
            <Stack direction="row" alignItems="center">
              <IconButton
                size={16}
                css={{
                  WebkitAppRegion: "no-drag"
                }}
                shape="square"
                padding={4}
                variant="plain"
                onClick={handleMinimize}
              >
                <MinusIcon />
              </IconButton>
              <IconButton
                shape="square"
                size={16}
                css={{
                  WebkitAppRegion: "no-drag",
                  userSelect: "auto"
                }}
                padding={4}
                variant="plain"
                onClick={handleMaximize}
              >
                <SquareIcon />
              </IconButton>
              <IconButton
                size={16}
                css={{
                  opacity: isUpdating ? 0.45 : 1,
                  pointerEvents: isUpdating ? "none" : "auto",
                  WebkitAppRegion: "no-drag",
                  userSelect: "auto"
                }}
                shape="square"
                padding={4}
                color={closeDanger ? "danger" : theme.typography.colors.primary}
                onMouseEnter={() => !isUpdating && setCloseDanger(true)}
                onMouseLeave={() => setCloseDanger(false)}
                variant={closeDanger ? "solid" : "plain"}
                onClick={handleClose}
                title={
                  isUpdating
                    ? tCommon("updater.pleaseWait")
                    : tCommon("close")
                }
              >
                <XIcon />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default observer(WindowTitleBar);
