import { createRootRoute, Outlet } from "@tanstack/react-router";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ThemeProvider } from "../contexts/ThemeManager";

const RootComponent = () => {
    return (
        <ThemeProvider>
            <Outlet />
            {import.meta.env.DEV && (
                <>
                    <ReactQueryDevtools />
                    <TanStackRouterDevtools />
                </>
            )}
        </ThemeProvider>
    );
};

export const Route = createRootRoute({
    component: RootComponent,
});
