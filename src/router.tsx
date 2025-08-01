import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { Provider } from "mobx-react";

import { AppStore } from "stores/App.store";
import { routeTree } from "./routeTree.gen";

export function createRouter(window: Window | undefined = globalThis.window) {
    const queryClient = new QueryClient();
    const appStore = new AppStore();

    return createTanStackRouter({
        routeTree,
        context: { queryClient },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration: true,

        // eslint-disable-next-line react/prop-types
        Wrap: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {window ? (
                    <Provider appStore={appStore}>{children}</Provider>
                ) : (
                    children
                )}
            </QueryClientProvider>
        ),
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
