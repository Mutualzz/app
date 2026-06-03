import { useAppStore } from "@hooks/useStores";
import { Stack } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/spaces/$spaceId")({
    component: observer(RouteComponent)
});

function RouteComponent() {
    const app = useAppStore();
    const navigate = useNavigate();
    const { spaceId } = Route.useParams();

    const childParams = useParams({
        from: "/_authenticated/spaces/$spaceId/$channelId",
        shouldThrow: false
    });

    useEffect(() => {
        app.spaces.setActive(spaceId);
    }, [app, spaceId]);

    useEffect(() => {
        if (childParams?.channelId) return;
        if (!app.isGatewayReady) return;

        const space = app.spaces.get(spaceId);
        if (!space) return;

        const preferred =
            app.channels.getMostRecentChannelForSpace(spaceId) ??
            app.channels.getFirstNavigableChannel(spaceId);
        if (!preferred) return;

        app.channels.setActive(preferred.id);

        navigate({
            to: "/spaces/$spaceId/$channelId",
            params: { spaceId, channelId: preferred.id },
            replace: true
        });
    }, [childParams?.channelId, spaceId, app.isGatewayReady, navigate, app]);

    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
