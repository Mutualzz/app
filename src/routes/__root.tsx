import "@fontsource/inter/100";
import "@fontsource/inter/200";
import "@fontsource/inter/300";
import "@fontsource/inter/400";
import "@fontsource/inter/500";
import "@fontsource/inter/600";
import "@fontsource/inter/700";
import "@fontsource/inter/800";
import "@fontsource/inter/900";

import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";

import { CssBaseline } from "@ui/CssBaseline";
import { ThemeProvider } from "@ui/ThemeProvider";

// Dev tools
import { wrapCreateRootRouteWithSentry } from "@sentry/tanstackstart-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { themesObj } from "@themes/index";
import { type ReactNode } from "react";
import { seo } from "seo";

export const Route = wrapCreateRootRouteWithSentry(createRootRoute)({
    head: () => ({
        meta: [...seo()],
    }),
    component: RootComponent,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html>
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    return (
        <RootDocument>
            <ThemeProvider themes={themesObj}>
                <CssBaseline />
                <Outlet />
                {import.meta.env.DEV && (
                    <>
                        <ReactQueryDevtools />
                        <TanStackRouterDevtools />
                    </>
                )}
            </ThemeProvider>
        </RootDocument>
    );
}
