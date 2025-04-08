import { createRootRoute, Outlet } from "@tanstack/react-router";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ThemeProvider } from "../contexts/ThemeManager";
import { GlobalStyles } from "../ui/GlobalStyles";

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
