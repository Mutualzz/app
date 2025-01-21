import { createRootRoute, Outlet } from "@tanstack/react-router";

// Theme Imports
import {
    ThemeProvider,
    createTheme,
    StyledEngineProvider,
} from "@mui/material/styles";

// Dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { CssBaseline } from "@mui/material";
import Navigation from "../components/Navigation.component";

// Theme
const theme = createTheme({
    palette: {
        mode: "dark",
    },
    typography: {
        fontFamily: "Montserrat, sans-serif",
    },
});

const RootComponent = () => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Navigation />
                <Outlet />
                {import.meta.env.DEV && (
                    <>
                        <ReactQueryDevtools initialIsOpen={false} />
                        <TanStackRouterDevtools />
                    </>
                )}
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export const Route = createRootRoute({
    component: RootComponent,
});
