import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Theme
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// Extended Theme
const theme = extendTheme({
    fontFamily: {
        display: "Montserrat",
        body: "Montserrat",
    },
});

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <CssVarsProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                <Outlet />
                {import.meta.env.DEV && (
                    <>
                        <ReactQueryDevtools initialIsOpen={false} />
                        <TanStackRouterDevtools />
                    </>
                )}
            </QueryClientProvider>
        </CssVarsProvider>
    ),
});
