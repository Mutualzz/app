import { observer } from "mobx-react-lite";
import { Stack } from "@mutualzz/ui-web";
import { DMChannelHeader } from "@components/DMChannel/DMChannelHeader";
import { useAppStore } from "@hooks/useStores";
import { MessageList } from "@components/Message/MessageList";
import { DMChannelMessageInput } from "@components/DMChannel/DMChannelMessageInput";

export const DMChannelView = observer(() => {
    const app = useAppStore();
    const channel = app.channels.active;

    if (!channel) return null;

    const handleRequestEditLatest = () => {
        if (!app.account) return;

        const latestMine = [...channel.messages.all]
            .filter(
                (m) => m.authorId === app.account!.id && !!m.content?.trim()
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        if (!latestMine) return;

        channel.messages.all.forEach((m) => m.setEditing(false));
        latestMine.setEditing(true);
    };

    return (
        <Stack direction="column" width="100%" height="100%">
            <DMChannelHeader channel={channel} />
            <Stack
                direction="column"
                flex="1 1 auto"
                position="relative"
                overflow="hidden"
            >
                <MessageList channel={channel} />
                <DMChannelMessageInput
                    channel={channel}
                    onRequestEditLatest={handleRequestEditLatest}
                />
            </Stack>
        </Stack>
    );
});
