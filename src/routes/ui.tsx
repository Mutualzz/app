import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PlaygrondLeftSidebar } from "@components/Playground/PlaygroundLeftSidebar";
import { Stack } from "@mutualzz/ui";

export const Route = createFileRoute("/ui")({
    component: Playground,
});

function Playground() {
    return (
        <Stack width="100%" direction="row" pt={10}>
            <PlaygrondLeftSidebar />
            <Stack flex={1}>
                <Outlet />
            </Stack>
        </Stack>
    );
}
