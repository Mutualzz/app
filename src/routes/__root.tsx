import { createRootRoute, Outlet } from "@tanstack/react-router";

import { GlobalStyles } from "@mutualzz/ui/GlobalStyles";
import { ThemeProvider } from "@mutualzz/ui/ThemeManager";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { themesObj } from "@themes/index";

const RootComponent = () => {
    return (
        <ThemeProvider themes={themesObj}>
            <GlobalStyles />
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
