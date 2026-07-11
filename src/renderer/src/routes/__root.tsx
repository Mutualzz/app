import "../styles/fonts";
import "../i18n";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import { GatewayCloseCodes } from "@mutualzz/types";
import { CssBaseline, Stack } from "@mutualzz/ui-web";
import { GatewayStatus } from "@stores/Gateway.store";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { isElectron } from "@utils/index";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

import { AppCrashFallback } from "@components/ErrorBoundary/AppCrashFallback";
import { DesktopShell } from "@components/Desktop/DesktopShell";
import { InjectGlobal } from "@components/InjectGlobal";
import Loader from "@components/Loader/Loader";
import { ModeSwitcher } from "@components/ModeSwitcher";
import WindowTitleBar from "@components/WindowTitleBar";
import { AppTheme } from "@contexts/AppTheme.context";
import { DesktopShellProvider } from "@contexts/DesktopShell.context";
import { ModalProvider } from "@contexts/Modal.context";
import { calendarStrings } from "@utils/i18n";
import { NavigationTracker } from "@components/NavigationTracker";
import { AppHotkeys } from "@components/AppHotkeys";
import { ContextMenuProvider } from "@contexts/ContextMenu.context";
import { WindowTitleBarProvider } from "@contexts/WindowTitleBar.context";
import { ModalRoot } from "@components/Modals/ModalRoot";
import { ScreenSharePicker } from "@components/Voice/ScreenSharePicker";
import { seo } from "@seo";
import { QueryClientProvider } from "@tanstack/react-query";
import { HotkeysProvider } from "@tanstack/react-hotkeys";
import { ToastContainer } from "react-toastify";

dayjs.extend(relativeTime);
dayjs.extend(calendar, calendarStrings);
dayjs.extend(duration);

export const Route = createRootRoute({
  component: observer(RootComponent),
  errorComponent: AppCrashFallback,
  head: () => ({
    meta: [...seo()],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" }
    ]
  })
});

function Providers({ children }: PropsWithChildren) {
  const emotionCache = createCache({ key: "mz" });

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Providers>
      <div
        style={{
          height: "100dvh",
          margin: 0,
          padding: 0,
          width: "100%",
          overflow: "hidden"
        }}
      >
        {children}
      </div>
    </Providers>
  );
}

function RootComponent() {
  const navigate = useNavigate();
  const app = useAppStore();
  const logger = new Logger({
    tag: "App"
  });
  const [titleBarHeight, setTitleBarHeight] = useState(0);

  useEffect(() => {
    app.loadSettings();

    const dispose = reaction(
      () => app.token,
      (value) => {
        if (value) {
          app.rest.setToken(value);
          if (app.gateway.readyState === GatewayStatus.CLOSED) {
            app.setGatewayReady(false);
            app.gateway.connect();
          } else {
            logger.debug("Gateway connect called but socket is not closed");
          }
        } else {
          logger.debug("user no longer authenticated");

          if (app.gateway.readyState === WebSocket.OPEN) {
            app.gateway.disconnect(
              GatewayCloseCodes.NotAuthenticated,
              "user is no longer authenticated"
            );
          }
        }
      },
      { fireImmediately: true }
    );

    logger.debug("Loading complete");

    return dispose;
  }, []);

  // Idle detection: auto-set status to idle after inactivity, revert when active again
  const wasAutoIdled = useRef(false);
  useEffect(() => {
    if (!isElectron || !window.api) return;

    // Push the stored threshold to the main process on mount
    const storedMs = app.settings?.idleThresholdMs ?? 5 * 60_000;
    window.api.idle.setThreshold(storedMs);

    const unsubscribe = window.api.idle.onIdleChange((state) => {
      const userId = app.account?.id;
      if (!userId) return;

      const currentStatus = app.presence.get(userId)?.status ?? "online";

      if ((state === "idle" || state === "locked") && !wasAutoIdled.current) {
        // Only auto-idle if the user hasn't manually set a non-online status
        if (currentStatus === "online") {
          wasAutoIdled.current = true;
          app.gateway.setStatus("idle");
        }
      } else if (state === "active" && wasAutoIdled.current) {
        wasAutoIdled.current = false;
        app.gateway.setStatus("online");
      }
    });

    return unsubscribe;
  }, [app.account?.id, app.settings?.idleThresholdMs]);

  useEffect(() => {
    if (!isElectron || !window.api) return;

    const handleDeepLink = async (urlStr: string) => {
      logger.debug("Deep link received:", urlStr);

      try {
        const url = new URL(urlStr);
        if (url.hostname === "invite") {
          const code = url.pathname.replace(/^\/+/, "");

          await navigate({
            to: "/invite/$code",
            replace: true,
            params: { code },
            search: {
              deepLink: true
            }
          });
        }
      } catch (err) {
        logger.error("Failed to handle deep link", err);
      }
    };

    window.api.events.onDeepLink(handleDeepLink);

    void window.api.app.getStartupDeepLink().then((url) => {
      if (url) void handleDeepLink(url);
    });
  }, [navigate, logger]);

  return (
    <QueryClientProvider client={app.queryClient}>
      <HotkeysProvider>
        <RootDocument>
          <AppTheme>
            <ModalProvider>
              <CssBaseline adaptiveScrollbar />
              <DesktopShellProvider>
                <WindowTitleBarProvider>
                  <WindowTitleBar onHeightChange={setTitleBarHeight} />
                  <DesktopShell>
                    <ContextMenuProvider>
                      <ToastContainer position="top-center" />
                      <ModalRoot />
                      <ScreenSharePicker />
                      <NavigationTracker />
                      <AppHotkeys />
                      <InjectGlobal />
                      <Loader>
                        <Stack
                          direction="column"
                          height="100%"
                          width="100%"
                          flex={1}
                          minHeight={0}
                          css={{
                            paddingTop: titleBarHeight
                          }}
                        >
                          <Stack
                            width="100%"
                            flex={1}
                            minHeight={0}
                            overflow="hidden"
                          >
                            <Outlet />
                          </Stack>
                          {app.account && <ModeSwitcher />}
                        </Stack>
                      </Loader>
                    </ContextMenuProvider>
                  </DesktopShell>
                </WindowTitleBarProvider>
              </DesktopShellProvider>
            </ModalProvider>
          </AppTheme>
        </RootDocument>
      </HotkeysProvider>
    </QueryClientProvider>
  );
}
