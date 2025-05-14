import { createLazyFileRoute } from "@tanstack/react-router";
import { Stack } from "@ui/index";

export const Route = createLazyFileRoute("/ui/")({
    component: PlaygroundIndexComponent,
});

function PlaygroundIndexComponent() {
    return (
        <Stack
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            fontSize="2rem"
        >
            Use buttons on the sidebar to navigate :3
        </Stack>
    );
}
