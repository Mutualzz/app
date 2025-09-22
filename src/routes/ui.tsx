import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PlaygroundLeftSidebar } from "@components/Playground/PlaygroundLeftSidebar";
import { Stack } from "@mutualzz/ui/web";

export const Route = createFileRoute("/ui")({
    component: Playground,
});

function Playground() {
    return (
        <Stack width="100%" direction="row" pt={10}>
            <PlaygroundLeftSidebar />
            <Stack flex={1}>
                <Outlet />
            </Stack>
        </Stack>
    );
}
