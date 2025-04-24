import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ThemeProvider } from "../contexts/ThemeManager";
import { GlobalStyles } from "../ui/GlobalStyles";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootComponent = () => {
    return (
        <ThemeProvider>
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
