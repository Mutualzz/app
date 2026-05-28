import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { DMChannelView } from "@components/Views/DMChannelView";

export const Route = createFileRoute("/_authenticated/@me/$channelId")({
    component: RouteComponent
});

function RouteComponent() {
    const app = useAppStore();
    const { channelId } = Route.useParams();

    useEffect(() => {
        app.spaces.unsetActive();
        app.channels.setActive(channelId);
        app.channels.setMostRecentChannelForSpace("@me", channelId );
    }, [channelId, app.isGatewayReady]);

    return (
        <Paper
            elevation={app.settings?.preferEmbossed ? 3 : 0}
            direction="column"
            flex="1 1 auto"
            overflow="hidden"
            borderLeft="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
        >
            <DMChannelView />
        </Paper>
    );
}
