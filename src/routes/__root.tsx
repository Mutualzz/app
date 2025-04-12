import { createRootRoute, Outlet } from "@tanstack/react-router";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Stack } from "@ui/layout/Stack/Stack";
import { ThemeProvider } from "../contexts/ThemeManager";
import { GlobalStyles } from "../ui/GlobalStyles";

const RootComponent = () => {
    return (
        <ThemeProvider>
            <GlobalStyles />
            <Stack direction="column" flex={1}>
                <Outlet />
            </Stack>
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
