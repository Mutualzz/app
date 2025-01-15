import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <QueryClientProvider client={queryClient}>
            <Outlet />
            {import.meta.env.DEV && (
                <>
                    <ReactQueryDevtools initialIsOpen={false} />
                    <TanStackRouterDevtools />
                </>
            )}
        </QueryClientProvider>
    ),
});
