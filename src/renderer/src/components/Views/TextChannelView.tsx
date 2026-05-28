import type { Channel } from "@stores/objects/Channel";
import { Stack } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList";
import { SpaceChannelMessageInput } from "@components/Channel/SpaceChannelMessageInput";
import { useAppStore } from "@hooks/useStores";
import { MemberList } from "@components/MemberList/MemberList";
import { TextChannelHeader } from "@components/Channel/TextChannelHeader";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";

interface Props {
    channel: Channel;
}

export const TextChannelView = observer(({ channel }: Props) => {
    const app = useAppStore();

    const handleRequestEditLatest = useCallback(() => {
        if (!app.account) return;

        const latestMine = [...channel.messages.all]
            .filter(
                (m) => m.authorId === app.account!.id && !!m.content?.trim()
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        if (!latestMine) return;

        channel.messages.all.forEach((m) => m.setEditing(false));
        latestMine.setEditing(true);
    }, [app.account, channel.messages.all]);

    return (
        <>
            <TextChannelHeader channel={channel} />
            <Stack direction="row" flex="1 1 auto" overflow="hidden">
                <Stack
                    direction="column"
                    flex="1 1 auto"
                    position="relative"
                    overflow="hidden"
                >
                    <MessageList channel={channel} />
                    <SpaceChannelMessageInput
                        channel={channel}
                        onRequestEditLatest={handleRequestEditLatest}
                    />
                </Stack>
                {app.mode === "spaces" && app.memberListVisible && (
                    <MemberList />
                )}
            </Stack>
        </>
    );
});
