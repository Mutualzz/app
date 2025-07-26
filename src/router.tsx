import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { Provider } from "mobx-react";

import { routeTree } from "./routeTree.gen";
import { appStore } from "./stores/App.store";

export function createRouter() {
    const queryClient = new QueryClient();

    return createTanStackRouter({
        routeTree,
        context: { queryClient },
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration: true,

        // eslint-disable-next-line react/prop-types
        Wrap: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                <Provider appStore={appStore}>{children}</Provider>
            </QueryClientProvider>
        ),
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
