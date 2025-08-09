import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { useAppStore } from "@hooks/useAppStore";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
    const queryClient = new QueryClient();
    const app = useAppStore();

    return createTanStackRouter({
        routeTree,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration: true,
        defaultSsr: false,
        context: { queryClient, app },

        // eslint-disable-next-line react/prop-types
        Wrap: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
