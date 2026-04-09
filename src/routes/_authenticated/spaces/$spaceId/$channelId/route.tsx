import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { TextChannelView } from "@components/Views/TextChannelView.tsx";
import { VoiceChannelView } from "@components/Views/VoiceChannelView.tsx";

export const Route = createFileRoute(
    "/_authenticated/spaces/$spaceId/$channelId",
)({
    component: observer(RouteComponent),
    validateSearch: (search) => ({
        ...(search.chat !== undefined ? { chat: search.chat } : {}),
    }),
});

function RouteComponent() {
    const app = useAppStore();
    const { spaceId, channelId } = Route.useParams();
    const { chat } = Route.useSearch();
    const navigate = useNavigate();

    const space = app.spaces.get(spaceId) ?? app.spaces.active;
    const activeChannel = useMemo(() => {
        if (!space) return null;

        const channel =
            space.channels.find((ch) => ch.id === channelId) ??
            space.visibleChannels.find((ch) => ch.id === channelId) ??
            null;

        if (!channel) return null;
        if (channel.isCategory) return null;

        return channel;
    }, [channelId]);

    const openChat = useMemo(
        () => activeChannel?.isVoiceChannel && chat === true,
        [chat, activeChannel?.isVoiceChannel],
    );

    useEffect(() => {
        if (!space) return;

        if (!activeChannel) {
            navigate({
                to: "/spaces",
                replace: true,
            });
            return;
        }

        runInAction(() => {
            app.spaces.setActive(spaceId);
            app.channels.setActive(channelId);
        });

        app.gateway.onChannelOpen(spaceId, channelId);
    }, [app, navigate, space, activeChannel, spaceId, channelId]);

    if (!activeChannel) {
        return (
            <Paper direction="column" flex="1 1 auto" overflow="hidden">
                <Stack alignItems="center" justifyContent="center" flex="1">
                    <Typography level="h5">Loading channel…</Typography>
                </Stack>
            </Paper>
        );
    }

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
            {activeChannel.isTextChannel && (
                <TextChannelView channel={activeChannel} />
            )}
            {activeChannel.isVoiceChannel && (
                <VoiceChannelView channel={activeChannel} showChat={openChat} />
            )}
        </Paper>
    );
}
