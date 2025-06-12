import { createLazyFileRoute } from "@tanstack/react-router";
import { Stack, Typography } from "@ui/index";

export const Route = createLazyFileRoute("/ui/")({
    component: PlaygroundIndexComponent,
});

function PlaygroundIndexComponent() {
    return (
        <Stack
            width="100%"
            height="100%"
            justifyContent="center"
            mx="auto"
            my="auto"
        >
            <Typography variant="none" level="display-sm">
                Use buttons on the sidebar to navigate :3
            </Typography>
        </Stack>
    );
}
