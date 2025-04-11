import {
    createLazyFileRoute,
    Outlet,
    useNavigate,
} from "@tanstack/react-router";

import { Button } from "@ui/inputs/Button/Button";
import { Stack } from "@ui/layout/Stack/Stack";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    const navigate = useNavigate();

    return (
        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap={10}
            style={{
                height: "100vh",
                width: "100vw",
                padding: 20,
            }}
        >
            <h1>Website is currently under development</h1>
            <h2>The UI is being made</h2>
            <Stack direction="row">
                <h2>Meanwhile you can,</h2>&nbsp;
                <Button
                    onClick={() => {
                        navigate({
                            to: "/ui",
                        });
                    }}
                    size="lg"
                    variant="solid"
                >
                    Go to the UI playground
                </Button>
            </Stack>
            <Outlet />
        </Stack>
    );
}
