import {
    createLazyFileRoute,
    Outlet,
    useNavigate,
} from "@tanstack/react-router";
import { Typography } from "@ui/components/data-display/Typography/Typography";

import { Button } from "@ui/components/inputs/Button/Button";
import { Stack } from "@ui/components/layout/Stack/Stack";

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
            spacing={10}
            height="100%"
        >
            <Typography level="h1">
                Website is currently under development
            </Typography>
            <Typography level="h4">The UI is being made</Typography>
            <Stack direction="row" alignItems="center" spacing={5}>
                <Typography level="h5">Meanwhile you can,</Typography>
                &nbsp;
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
