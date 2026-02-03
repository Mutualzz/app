import "@fontsource/inter/100";
import "@fontsource/inter/200";
import "@fontsource/inter/300";
import "@fontsource/inter/400";
import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";
import "@fontsource/rubik/300";
import "@fontsource/rubik/400";
import "@fontsource/rubik/500";
import "@fontsource/rubik/600";
import "@fontsource/rubik/700";
import "@fontsource/rubik/800";
import "@fontsource/rubik/900";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import { GatewayCloseCodes } from "@mutualzz/types";
import { CssBaseline, Stack, Typography } from "@mutualzz/ui-web";
import { useNetworkState } from "@react-hookz/web";
import { seo } from "@seo";
import { GatewayStatus } from "@stores/Gateway.store";
import type { QueryClient } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    HeadContent,
    Outlet,
    Scripts,
    useNavigate,
    useRouterState,
} from "@tanstack/react-router";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch, locale, platform, version } from "@tauri-apps/plugin-os";
import { isTauri } from "@utils/index";
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
    useState,
} from "react";

import { APIErrorListener } from "@components/APIErrorListener";
import { DesktopShell } from "@components/Desktop/DesktopShell";
import { InjectGlobal } from "@components/InjectGlobal";
import Loader from "@components/Loader/Loader";
import { ModeSwitcher } from "@components/ModeSwitcher";
import { Paper } from "@components/Paper";
import WindowTitleBar from "@components/WindowTitleBar";
import { AppTheme } from "@contexts/AppTheme.context";
import { DesktopShellProvider } from "@contexts/DesktopShell.context";
import { ModalProvider } from "@contexts/Modal.context";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { calendarStrings } from "@utils/i18n";
import { UpdatingOverlay } from "@components/UpdatingOverlay";
import { NavigationTracker } from "@components/NavigationTracker";
import { AppHotkeys } from "@components/AppHotkeys";

dayjs.extend(relativeTime);
dayjs.extend(calendar, calendarStrings);
dayjs.extend(duration);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
    {
        head: () => ({
            meta: [...seo()],
            links: [
                { rel: "manifest", href: "/manifest.json" },
                { rel: "icon", href: "/favicon.ico" },
            ],
        }),
        component: observer(RootComponent),
        ssr: true,
    },
);

function Providers({ children }: PropsWithChildren) {
    const emotionCache = createCache({ key: "mz" });

    return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <HeadContent />
            </head>
            <Providers>
                <body
                    css={{
                        height: "100dvh",
                        margin: 0,
                        padding: 0,
                        width: "100vw",
                        overflow: "hidden",
                    }}
                    onContextMenu={(e) =>
                        import.meta.env.PROD && e.preventDefault()
                    }
                >
                    {children}
                    <Scripts />
                </body>
            </Providers>
        </html>
    );
}

function RootComponent() {
    const navigate = useNavigate();
    const app = useAppStore();
    const logger = new Logger({
        tag: "App",
    });
    const [titleBarHeight, setTitleBarHeight] = useState(0);

    const networkState = useNetworkState();

    const didRestoreNavRef = useRef(false);
    const didDeepLinkRef = useRef(false);

    const currentRouterHref = useRouterState({
        select: (state) => state.location.href,
    });

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
                        logger.debug(
                            "Gateway connect called but socket is not closed",
                        );
                    }
                } else {
                    logger.debug("user no longer authenticated");

                    if (app.gateway.readyState === WebSocket.OPEN) {
                        app.gateway.disconnect(
                            GatewayCloseCodes.NotAuthenticated,
                            "user is no longer authenticated",
                        );
                    }
                }
            },
            { fireImmediately: true },
        );

        const loadAsyncGlobals = async () => {
            const [
                tauriVersion,
                appVersion,
                platformName,
                platformArch,
                platformVersion,
                platformLocale,
            ] = await Promise.all([
                getTauriVersion(),
                getVersion(),
                platform(),
                arch(),
                version(),
                locale(),
            ]);
            window.globals = {
                tauriVersion: tauriVersion,
                appVersion: appVersion,
                platform: {
                    name: platformName,
                    arch: platformArch,
                    version: platformVersion,
                    locale: platformLocale,
                },
            };
        };

        if (isTauri) loadAsyncGlobals();

        logger.debug("Loading complete");

        return dispose;
    }, []);

    useEffect(() => {
        if (!isTauri) return;

        const win = getCurrentWindow();

        const dispose = reaction(
            () => ({
                stage: app.updater?.stage,
                forceUpdateActive: app.updater?.forceUpdate,
            }),
            async ({ stage, forceUpdateActive }) => {
                const isForcedBlocking =
                    !import.meta.env.DEV &&
                    !!forceUpdateActive &&
                    (stage === "downloading" ||
                        stage === "installing" ||
                        stage === "relaunching");

                const isNormalBlocking =
                    !forceUpdateActive &&
                    (stage === "installing" || stage === "relaunching");

                const shouldBlockClose = isForcedBlocking || isNormalBlocking;

                await win.setClosable(!shouldBlockClose);
            },
            { fireImmediately: true },
        );

        return dispose;
    }, []);

    useEffect(() => {
        if (!isTauri) return;

        const win = getCurrentWindow();

        const unlistenP = listen<string[]>("app://open-url", async (e) => {
            // Try focus again from the UI thread
            await win.show();
            await win.unminimize();
            await win.setFocus();

            didDeepLinkRef.current = true;

            const urlStr = e.payload.find((x) => x.startsWith("mutualzz://"));
            if (!urlStr) return;

            const url = new URL(urlStr);
            if (url.hostname === "invite") {
                const code = url.pathname.replace(/^\/+/, "");

                await navigate({
                    to: "/invite/$code",
                    replace: true,
                    params: { code },
                    search: {
                        deepLink: true,
                    },
                });
            }
        });

        return () => {
            unlistenP.then((u) => u());
        };
    }, []);

    useEffect(() => {
        if (!import.meta.env.DEV) return;

        const onKeyDown = (e: KeyboardEvent) => {
            const modifierOk = (e.metaKey || e.ctrlKey) && e.shiftKey;
            if (!modifierOk) return;

            const updater = app.updater;
            if (!updater) return;

            // Stages
            if (e.key === "1") updater.debugSetStage("downloading");
            if (e.key === "2") updater.debugSetStage("installing");
            if (e.key === "6") updater.debugSetStage("relaunching");
            if (e.key === "0") updater.debugSetStage("idle");

            if (e.key.toLowerCase() === "f")
                updater.debugSetForceGate(!updater.forceUpdate);

            // Force-gate ON (dev only)
            if (e.key.toLowerCase() === "g") {
                updater.debugSetForceGate(true);
                updater.debugSetStage("downloading");
            }

            // Force-gate OFF (dev only)
            if (e.key.toLowerCase() === "h") {
                updater.debugSetForceGate(false);
                updater.debugSetStage("idle");
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (didRestoreNavRef.current) return;
        if (didDeepLinkRef.current) return;

        const targetHref = app.navigation.current?.href;
        if (!targetHref) return;

        if (targetHref === "/spaces" || targetHref === "/feed") return;

        if (targetHref === currentRouterHref) {
            didRestoreNavRef.current = true;
            return;
        }

        didRestoreNavRef.current = true;

        navigate({
            to: targetHref,
            replace: true,
        });
    }, [currentRouterHref, app.navigation.current?.href]);

    const stage = app.updater?.stage;
    const forceGate =
        !!app.updater?.forceUpdate &&
        (stage === "downloading" ||
            stage === "installing" ||
            stage === "relaunching" ||
            stage === "error");

    return (
        <RootDocument>
            <AppTheme>
                <ModalProvider>
                    <CssBaseline adaptiveScrollbar />
                    <DesktopShellProvider>
                        <WindowTitleBar onHeightChange={setTitleBarHeight} />
                        <DesktopShell>
                            <NavigationTracker />
                            <AppHotkeys />
                            <UpdatingOverlay />

                            {forceGate ? null : (
                                <>
                                    {!networkState.online && (
                                        <Paper
                                            alignItems="center"
                                            justifyContent="center"
                                            variant="solid"
                                            color="danger"
                                        >
                                            <Typography level="body-lg">
                                                You are currently offline
                                            </Typography>
                                        </Paper>
                                    )}

                                    <InjectGlobal />
                                    <APIErrorListener />
                                    <Loader>
                                        <Stack
                                            direction="column"
                                            height="100vh"
                                            width="100vw"
                                            flex={1}
                                            minHeight={0}
                                            css={{
                                                paddingTop: titleBarHeight,
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
                                    {/*{import.meta.env.DEV && (*/}
                                    {/*    <>*/}
                                    {/*        <TanStackRouterDevtools />*/}
                                    {/*    </>*/}
                                    {/*)}*/}
                                </>
                            )}
                        </DesktopShell>
                    </DesktopShellProvider>
                </ModalProvider>
            </AppTheme>
        </RootDocument>
    );
}
