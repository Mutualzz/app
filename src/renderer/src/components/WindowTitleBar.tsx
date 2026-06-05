import { WINDOW_TITLEBAR_ZINDEX } from "@renderer/types";
import { Paper } from "@components/Paper";
import { useDesktopShell } from "@contexts/DesktopShell.context";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
  Box,
  ButtonGroup,
  Divider,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DownloadIcon,
  MinusIcon,
  PlanetIcon,
  ScribbleIcon,
  SquareIcon,
  UsersThreeIcon,
  XIcon
} from "@phosphor-icons/react";
import { ThemeCreatorModal } from "./ThemeCreator/ThemeCreatorModal";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { IconButton } from "./IconButton";
import { DownloadButton } from "./DownloadButton";
import { useNetworkState } from "@react-hookz/web";
import { Button } from "@components/Button";
import { isElectron } from "@utils/index";

interface WindowTitleBarProps {
  onHeightChange?: (height: number) => void;
}

const WindowTitleBar = ({ onHeightChange }: WindowTitleBarProps) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { inPreview, stopPreview, values } = app.themeCreator;
  const { openModal } = useModal();
  const { theme, changeTheme } = useTheme();
  const { os } = useDesktopShell();
  const networkState = useNetworkState();

  const [closeDanger, setCloseDanger] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const isMac = os.platform === "macos";

  const stage = app.updater?.stage;

  const isUpdating = stage === "installing" || stage === "relaunching";

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    if (isUpdating || app.updater?.forceUpdate) return;
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
  }, [isMac, isUpdating, onHeightChange, app.updater?.forceUpdate]);

  const handleMinimize = () => {
    window.api?.window.minimize();
  };

  const handleMaximize = () => {
    window.api?.window.maximize();
  };

  const handleClose = () => {
    window.api?.window.close();
  };

  if (isUpdating || app.updater?.forceUpdate) return null;

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
          <Typography level="body-lg">You are currently offline</Typography>
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
              Reconnect
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
      <Paper
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
        <Stack
          alignItems="center"
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
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
              spacing={2}
            >
              <ButtonGroup variant="plain" spacing={0.001} size="sm">
                <IconButton
                  disabled={!app.navigation.canBack}
                  onClick={() => app.navigation.back(navigate)}
                  css={{
                    WebkitAppRegion: "no-drag",
                    userSelect: "auto"
                  }}
                >
                  <Tooltip content={<TooltipWrapper>Go Back</TooltipWrapper>}>
                    <ArrowLeftIcon weight="fill" />
                  </Tooltip>
                </IconButton>
                <IconButton
                  disabled={!app.navigation.canForward}
                  onClick={() => app.navigation.forward(navigate)}
                  css={{
                    WebkitAppRegion: "no-drag",
                    userSelect: "auto"
                  }}
                >
                  <Tooltip
                    content={<TooltipWrapper>Go Forward</TooltipWrapper>}
                  >
                    <ArrowRightIcon weight="fill" />
                  </Tooltip>
                </IconButton>
              </ButtonGroup>
              {inPreview && (
                <Stack spacing={5} alignItems="center">
                  <Typography
                    css={{
                      userSelect: "none"
                    }}
                    fontWeight="bold"
                    ml={2}
                  >
                    Currently previewing a theme
                    {values.name ? `: ${values.name}` : ""}
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
                    Stop preview
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
        <Stack
          width="100%"
          spacing={1.25}
          direction="row"
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
          alignItems="center"
          justifyContent="center"
          flex={1}
        >
          {app.mode === "@me" && (
            <>
              <UsersThreeIcon weight="fill" />
              <Typography fontWeight="bold">Direct Messages</Typography>
            </>
          )}
          {app.mode === "spaces" && (
            <>
              <PlanetIcon weight="fill" />
              <Typography fontWeight="bold">Spaces</Typography>
            </>
          )}
          {app.mode === "feed" && (
            <>
              <ScribbleIcon />
              <Typography fontWeight="bold">Feed</Typography>
            </>
          )}
        </Stack>
        <Stack
          flex={1}
          alignItems="center"
          justifyContent="flex-end"
          css={{ WebkitAppRegion: "drag", userSelect: "none" }}
        >
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
          {isElectron && app.updater?.updateInfo && (
            <Stack px={isMac ? 3.75 : 0} alignItems="center" spacing={2}>
              <IconButton
                onClick={() => app.updater?.installUpdate()}
                size={18}
                variant="plain"
                color="success"
                css={{
                  height: 32,
                  width: 32,
                  padding: 4,
                  borderRadius: 6,
                  transition: "background .12s, color .12s",
                  WebkitAppRegion: "no-drag",
                  userSelect: "auto"
                }}
              >
                <DownloadIcon />
              </IconButton>
              {!isMac && (
                <Divider
                  lineColor="neutral"
                  orientation="vertical"
                  css={{
                    marginRight: 8,
                    opacity: 0.25
                  }}
                />
              )}
            </Stack>
          )}
          {!isMac && isElectron && (
            <Stack direction="row" alignItems="center">
              <IconButton
                css={{
                  width: 32,
                  height: 32,
                  WebkitAppRegion: "no-drag",
                  userSelect: "auto"
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
                css={{
                  width: 32,
                  height: 32,
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
                css={{
                  opacity: isUpdating ? 0.45 : 1,
                  pointerEvents: isUpdating ? "none" : "auto",
                  width: 32,
                  height: 32,
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
                size={18}
                title={isUpdating ? "Updating… please wait" : "Close"}
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
