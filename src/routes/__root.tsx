import { createRootRoute, Outlet } from "@tanstack/react-router";

import { CssBaseline } from "@ui/CssBaseline";
import { ThemeProvider } from "@ui/ThemeProvider";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { themesObj } from "@themes/index";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
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
    );
}
