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
    const params = useParams({
        from: "/_authenticated/spaces/$spaceId/$channelId",
        shouldThrow: false,
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (params && (params.spaceId || params.channelId)) return;

        const channel = app.channels.preferredChannel;
        if (!channel || !channel.spaceId) return;

        navigate({
            to: "/spaces/$spaceId/$channelId",
            params: { spaceId: channel.spaceId, channelId: channel.id },
        });
    }, [params]);

    useEffect(() => {
        if (!params?.spaceId) return;

        app.spaces.setActive(params.spaceId);
    }, []);

    return (
        <Stack direction="row" width="100%" height="100%">
            <Outlet />
        </Stack>
    );
}
