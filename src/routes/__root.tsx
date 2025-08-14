import { AppTheme } from "@contexts/AppTheme.context";
import { ModalProvider } from "@contexts/Modal.context";
import "@fontsource/inter/100";
import "@fontsource/inter/200";
import "@fontsource/inter/300";
import "@fontsource/inter/400";
import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";
import { useAppStore } from "@hooks/useStores";
import { Logger } from "@logger";
import { GatewayCloseCodes } from "@mutualzz/types";
import { CssBaseline, Paper, Typography } from "@mutualzz/ui";
import { useNetworkState } from "@react-hookz/web";
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import { seo } from "@seo";
import { GatewayStatus } from "@stores/Gateway.store";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { arch, locale, platform, version } from "@tauri-apps/plugin-os";
import { isTauri } from "@utils/index";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useEffect, type ReactNode } from "react";

export const Route = wrapCreateRootRouteWithSentry(createRootRoute)({
    head: () => ({
        meta: [...seo()],
    }),
    component: observer(RootComponent),
    ssr: true,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <HeadContent />
            </head>
            <body
                css={{
                    height: "100vh",
                }}
            >
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const app = useAppStore();
    const { gateway, rest } = app;
    const logger = new Logger({
        tag: "App",
    });

    useEffect(() => {
        const dispose = reaction(
            () => app.token,
            (value) => {
                if (value) {
                    rest.setToken(value);
                    if (gateway.readyState === GatewayStatus.CLOSED) {
                        app.setGatewayReady(false);
                        gateway.connect();
                    } else {
                        logger.debug(
                            "Gateway connect called but socket is not closed",
                        );
                    }
                } else {
                    logger.debug("user no longer authenticated");
                    if (gateway.readyState === WebSocket.OPEN) {
                        gateway.disconnect(
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
        app.setAppLoading(false);

        return dispose;
    }, []);

    return (
        <RootDocument>
            <AppTheme>
                <CssBaseline />
                {app.isAppLoading ? <></> : <App />}
            </AppTheme>
        </RootDocument>
    );
}

const App = observer(() => {
    const networkState = useNetworkState();

    return (
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

            <Outlet />
            {import.meta.env.DEV && (
                <>
                    <ReactQueryDevtools />
                    <TanStackRouterDevtools />
                </>
            )}
        </ModalProvider>
    );
});
