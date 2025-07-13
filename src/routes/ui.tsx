import { Outlet, createFileRoute } from "@tanstack/react-router";

import { PlaygrondLeftSidebar } from "@components/PlaygroundLeftSidebar";
<<<<<<< HEAD
import { Stack } from "@mutualzz/ui";
=======
import { Stack } from "@ui";
>>>>>>> c64b18b0ba63d0fb8b9fb255c9575caf8f81ea36

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
