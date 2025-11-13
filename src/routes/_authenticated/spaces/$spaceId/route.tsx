import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { FaHashtag } from "react-icons/fa";

export const Route = createFileRoute("/_authenticated/spaces/$spaceId")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();
    const { spaceId } = Route.useParams();
    const channelParams = useParams({
        from: "/_authenticated/spaces/$spaceId/$channelId",
        shouldThrow: false,
    });

    useEffect(() => {
        app.spaces.setActive(spaceId);
    }, [spaceId]);

    if (!app.spaces.active) return null;

    if (!channelParams)
        return (
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100%"
            >
                <Typography
                    display="flex"
                    direction="row"
                    textColor="muted"
                    spacing={5}
                    level="h4"
                >
                    <FaHashtag /> Select a channel to get started.
                </Typography>
            </Stack>
        );

    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
