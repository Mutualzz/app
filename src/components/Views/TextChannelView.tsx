import type { Channel } from "@stores/objects/Channel.ts";
import { Stack } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList.tsx";
import { MessageInput } from "@components/Message/MessageInput.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { MemberList } from "@components/MemberList/MemberList.tsx";
import { TextChannelHeader } from "@components/Channel/TextChannelHeader.tsx";
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
                (m) => m.authorId === app.account!.id && !!m.content?.trim(),
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
                    <MessageInput
                        onRequestEditLatest={handleRequestEditLatest}
                    />
                </Stack>
                {app.memberListVisible && <MemberList />}
            </Stack>
        </>
    );
});
