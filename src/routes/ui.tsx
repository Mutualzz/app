import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PlaygrondLeftSidebar } from "@components/PlaygroundLeftSidebar";
import { Stack } from "@mutualzz/ui";

export const Route = createFileRoute("/ui")({
    component: Playground,
});

function Playground() {
    return (
        <Stack height="100%" direction="row" spacing={10} p={20}>
            <PlaygrondLeftSidebar />
            <Outlet />
        </Stack>
    );
}
