import { useAppStore } from "@hooks/useStores.ts";
import { Stack } from "@mutualzz/ui-web";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/spaces/$spaceId")({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();

    const { spaceId } = Route.useParams();
    const childParams = useParams({
        from: "/_authenticated/spaces/$spaceId/$channelId",
        shouldThrow: false,
    });
    const navigate = useNavigate();

    useEffect(() => {
        app.spaces.setActive(spaceId);
    }, [spaceId]);

    useEffect(() => {
        if (childParams?.channelId) return;

        const channel = app.channels.preferredChannel;
        if (!channel) return;
        if (channel.spaceId !== spaceId) return;

        navigate({
            to: "/spaces/$spaceId/$channelId",
            params: { spaceId, channelId: channel.id },
            replace: true,
        });
    }, [childParams?.channelId, app.channels.preferredChannel, spaceId]);

    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
