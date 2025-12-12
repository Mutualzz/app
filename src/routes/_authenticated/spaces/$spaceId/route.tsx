import { Stack } from "@mutualzz/ui-web";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createFileRoute("/_authenticated/spaces/$spaceId")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
