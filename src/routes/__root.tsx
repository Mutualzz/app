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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { themesObj } from "@themes/index";
import type { ReactNode } from "react";
import { seo } from "seo";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            ...seo({
                title: "Mutualzz (Under Development)",
                description:
                    "Connect with other people who share your interests. Currently under heavy development. UI is being made from scratch, so only UI playground is available. In the future there will be a lot fun on this website :3",
            }),
        ],
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
