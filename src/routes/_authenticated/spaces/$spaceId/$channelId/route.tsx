import { ChannelHeader } from "@components/Channel/ChannelHeader";
import { MemberList } from "@components/MemberList/MemberList.tsx";
import { MessageInput } from "@components/Message/MessageInput";
import { MessageList } from "@components/Message/MessageList";
import { Paper } from "@components/Paper.tsx";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { createFileRoute } from "@tanstack/react-router";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import { useEffect } from "react";

export const Route = createFileRoute(
    "/_authenticated/spaces/$spaceId/$channelId",
)({
    component: observer(RouteComponent),
});

function RouteComponent() {
    const app = useAppStore();

    useEffect(() => {
        if (!app.channels.activeId || !app.spaces.activeId) return;

        runInAction(() => {
            app.gateway.onChannelOpen(
                app.spaces.activeId!,
                app.channels.activeId!,
            );
        });
    }, [app.channels.activeId, app.spaces.activeId]);

    return (
        <Paper
            elevation={app.preferEmbossed ? 3 : 0}
            direction="column"
            flex="1 1 auto"
            overflow="hidden"
            borderLeft="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
        >
            {!app.channels.active && (
                <Stack
                    direction="column"
                    flex="1 1 auto"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                >
                    <Typography level="h5">Why are we still here?</Typography>
                    <Typography level="h6" fontWeight="bold">
                        Just to suffer?
                    </Typography>
                    <Typography level="body-lg">
                        Every night, I can feel my leg...
                    </Typography>
                    <Typography level="body-md">
                        And my arm... even my fingers... The body I've lost...
                    </Typography>
                    <Typography level="body-xs">
                        the comrades I've lost... won't stop hurting... It's
                        like they're all still there.
                    </Typography>
                </Stack>
            )}
            {app.channels.active && (
                <>
                    <ChannelHeader channel={app.channels.active} />
                    <Stack direction="row" flex="1 1 auto" overflow="hidden">
                        <Stack
                            direction="column"
                            flex="1 1 auto"
                            position="relative"
                            overflow="hidden"
                        >
                            <MessageList
                                space={app.spaces.active}
                                channel={app.channels.active}
                            />
                            <MessageInput channel={app.channels.active} />
                        </Stack>
                        {app.memberListVisible && <MemberList />}
                    </Stack>
                </>
            )}
        </Paper>
    );
}
