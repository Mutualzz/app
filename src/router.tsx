import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export function createRouter() {
    const queryClient = new QueryClient();

    const router = createTanStackRouter({
        routeTree,
        context: { queryClient },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        // eslint-disable-next-line react/prop-types
        Wrap: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    });

    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        sendDefaultPii: true,
        integrations: [
            Sentry.tanstackRouterBrowserTracingIntegration(router),
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        tracePropagationTargets: ["https://mutualzz.com", "localhost"],
        replaysSessionSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
        replaysOnErrorSampleRate: 1.0,
    });

    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
