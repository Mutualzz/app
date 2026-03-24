import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";

export const Route = createFileRoute("/_authenticated/spaces/$spaceId")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();
    const navigate = useNavigate();
    const { spaceId } = Route.useParams();

    const childParams = useParams({
        from: "/_authenticated/spaces/$spaceId/$channelId",
        shouldThrow: false,
    });

    const space = app.spaces.get(spaceId) ?? app.spaces.active;

    const preferredChannel = useMemo(() => {
        if (!space) return null;

        return (
            space.channels.find((channel) => channel.canRedirect) ??
            space.visibleChannels.find((channel) => channel.canRedirect) ??
            null
        );
    }, [space]);

    useEffect(() => {
        app.spaces.setActive(spaceId);
    }, [app, spaceId]);

    useEffect(() => {
        if (childParams?.channelId) return;
        if (!space) return;
        if (!preferredChannel) return;

        app.channels.setActive(preferredChannel.id);

        navigate({
            to: "/spaces/$spaceId/$channelId",
            params: {
                spaceId,
                channelId: preferredChannel.id,
            },
            replace: true,
        });
    }, [app, childParams?.channelId, space, preferredChannel, navigate, spaceId]);

    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
