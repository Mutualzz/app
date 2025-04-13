import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

// Dev tools
import { ThemeProvider } from "@contexts/ThemeManager";

import { CssBaseline } from "@mui/joy";

const RootComponent = () => {
    return (
        <ThemeProvider>
            <CssBaseline />
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
