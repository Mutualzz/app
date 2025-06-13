import { Outlet, useNavigate } from "@tanstack/react-router";
import { Typography } from "@ui/components/data-display/Typography/Typography";

import { Button } from "@ui/components/inputs/Button/Button";
import { Stack } from "@ui/components/layout/Stack/Stack";

export const Route = createLazyFileRoute({
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
            mx="auto"
            my="auto"
        >
            <Typography level="h1">
                Website is currently under development
            </Typography>
            <Typography level="h4">
                The UI is being made from scratch
            </Typography>
            <Typography level="h5">It&apos;s open source too :3</Typography>
            <Stack direction="row" alignItems="center">
                <Typography level="h5">Meanwhile you can</Typography>
                <Button
                    onClick={() => {
                        navigate({
                            to: "/ui",
                        });
                    }}
                    size="lg"
                    variant="solid"
                    color="primary"
                >
                    Go to the UI playground
                </Button>
            </Stack>
            <Outlet />
        </Stack>
    );
}
