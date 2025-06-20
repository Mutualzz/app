import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Stack } from "@ui/components/layout/Stack/Stack";

import { PlaygrondLeftSidebar } from "@components/PlaygroundLeftSidebar";

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
