import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { useAppStore } from "@hooks/useStores";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
    const app = useAppStore();
    const queryClient = app.queryClient;

    return createTanStackRouter({
        routeTree,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        scrollRestoration: true,
        context: {
            queryClient,
        },
    });
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
