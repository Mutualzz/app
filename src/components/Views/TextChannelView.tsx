import type { Channel } from "@stores/objects/Channel.ts";
import { Stack } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList.tsx";
import { MessageInput } from "@components/Message/MessageInput.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { MemberList } from "@components/MemberList/MemberList.tsx";
import { TextChannelHeader } from "@components/Channel/TextChannelHeader.tsx";
import { observer } from "mobx-react-lite";

interface Props {
    channel: Channel;
}

export const TextChannelView = observer(({ channel }: Props) => {
    const app = useAppStore();

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
                    <MessageInput channel={channel} />
                </Stack>
                {app.memberListVisible && <MemberList />}
            </Stack>
        </>
    );
});
