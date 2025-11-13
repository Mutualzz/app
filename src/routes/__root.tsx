import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
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
import { useAppStore } from "@hooks/useStores";
import { Logger } from "@mutualzz/logger";
import { GatewayCloseCodes } from "@mutualzz/types";
import { CssBaseline, Paper, Stack, Typography } from "@mutualzz/ui-web";
import { useNetworkState } from "@react-hookz/web";
import { seo } from "@seo";
import { GatewayStatus } from "@stores/Gateway.store";
import type { QueryClient } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch, locale, platform, version } from "@tauri-apps/plugin-os";
import { isTauri } from "@utils/index";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import {
    useEffect,
    useState,
    type PropsWithChildren,
    type ReactNode,
} from "react";

import { DesktopShell } from "@components/Desktop/DesktopShell";
import Loader from "@components/Loader/Loader";
import { ModeSwitcher } from "@components/ModeSwitcher";
import { BottomNavigation } from "@components/Navigation/BottomNavigation";
import { TopNavigation } from "@components/Navigation/TopNavigation";
import { AppTheme } from "@contexts/AppTheme.context";
import { DesktopShellProvider } from "@contexts/DesktopShell.context";
import { ModalProvider } from "@contexts/Modal.context";

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
    const emotionCache = createCache({ key: "css" });

    return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <HeadContent />
            </head>
            <body
                css={{
                    height: "100dvh",
                    margin: 0,
                    padding: 0,
                    width: "100vw",
                    overflow: "hidden",
                }}
                onContextMenu={(e) => e.preventDefault()}
            >
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const app = useAppStore();
    const logger = new Logger({
        tag: "App",
    });
    const [titlebarHeight, setTitlebarHeight] = useState(0);

    const networkState = useNetworkState();

    useEffect(() => {
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

        app.loadSettings();

        logger.debug("Loading complete");

        return dispose;
    }, []);

    return (
        <RootDocument>
            <Providers>
                <AppTheme>
                    <CssBaseline adaptiveScrollbar />
                    <DesktopShellProvider>
                        <DesktopShell
                            titleBarProps={{
                                onHeightChange: setTitlebarHeight,
                            }}
                        >
                            <ModalProvider>
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

                                <Loader>
                                    <Stack
                                        direction="column"
                                        height="100vh"
                                        width="100vw"
                                        flex={1}
                                        minHeight={0}
                                        css={{
                                            paddingTop: titlebarHeight,
                                        }}
                                    >
                                        <TopNavigation />
                                        <Stack
                                            width="100%"
                                            flex={1}
                                            minHeight={0}
                                            overflow="hidden"
                                        >
                                            <Outlet />
                                        </Stack>
                                        <BottomNavigation />
                                        {app.account && <ModeSwitcher />}
                                    </Stack>
                                </Loader>
                            </ModalProvider>
                        </DesktopShell>
                    </DesktopShellProvider>
                </AppTheme>
            </Providers>
        </RootDocument>
    );
}
