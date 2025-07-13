import { Button, Stack, Typography } from "@mutualzz/ui";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const navigate = useNavigate();

    return (
        <Stack
            direction="column"
            height="100vh"
            justifyContent="center"
            alignItems="center"
        >
            <Typography level="h2">
                Website is currently under heavy development
            </Typography>
            <Typography level="h4">
                The UI is being made from scratch
            </Typography>
            <Typography level="h5">It&apos;s open source too :3</Typography>
            <Stack spacing={10} direction="row" alignItems="center">
                <Typography level="h5">Meanwhile you can</Typography>
                <Button
                    onClick={() => {
                        navigate({
                            to: "/ui",
                        });
                    }}
                    size="lg"
                    variant="solid"
                    color="info"
                >
                    Go to the UI playground
                </Button>
            </Stack>
            <Outlet />
        </Stack>
    );
}
