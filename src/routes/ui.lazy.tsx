import { createLazyFileRoute, Outlet } from "@tanstack/react-router";

import { Stack } from "@mutualzz/ui/layout/Stack/Stack";

import { PlaygrondLeftSidebar } from "@components/PlaygroundLeftSidebar";

export const Route = createLazyFileRoute("/ui")({
    component: Playground,
});

function Playground() {
    return (
        <Stack height="100%" direction="row" gap={20}>
            <PlaygrondLeftSidebar />
            <Outlet />
        </Stack>
    );
}
