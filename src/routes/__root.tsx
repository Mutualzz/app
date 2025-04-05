import { createRootRoute, Outlet } from "@tanstack/react-router";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const RootComponent = () => {
    return (
        <>
            <Outlet />
            {import.meta.env.DEV && (
                <>
                    <ReactQueryDevtools />
                    <TanStackRouterDevtools />
                </>
            )}
        </>
    );
};

export const Route = createRootRoute({
    component: RootComponent,
});
