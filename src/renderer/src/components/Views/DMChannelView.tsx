import { observer } from "mobx-react-lite";
import { Stack } from "@mutualzz/ui-web";
import { DMChannelHeader } from "@components/DMChannel/DMChannelHeader";
import { useAppStore } from "@hooks/useStores";
import { DMGroupMemberList } from "@components/DMChannel/DMGroupMemberList";
import { ChannelType } from "@mutualzz/types";
import { MessageList } from "@components/Message/MessageList";
import { MessageInput } from "@components/Message/MessageInput";

export const DMChannelView = observer(() => {
  const app = useAppStore();
  const channel = app.channels.active;

  if (!channel) return null;

  const handleRequestEditLatest = () => {
    if (!app.account) return;

    const latestMine = [...channel.messages.all]
      .filter((m) => m.authorId === app.account!.id && !!m.content?.trim())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestMine) return;

    channel.messages.all.forEach((m) => m.setEditing(false));
    latestMine.setEditing(true);
  };

  return (
    <Stack direction="column" width="100%" height="100%">
      <DMChannelHeader channel={channel} />
      <Stack direction="row" flex="1 1 auto" overflow="hidden">
        <Stack
          direction="column"
          flex="1 1 auto"
          position="relative"
          overflow="hidden"
        >
          <MessageList channel={channel} />
          <MessageInput
            channel={channel}
            onRequestEditLatest={handleRequestEditLatest}
          />
        </Stack>
        {app.memberListVisible && channel.type === ChannelType.GroupDM && (
          <DMGroupMemberList />
        )}
      </Stack>
    </Stack>
  );
});
