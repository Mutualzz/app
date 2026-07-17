import type { Channel } from "@stores/objects/Channel";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList";
import { MessageInput } from "@components/Message/MessageInput";
import { useAppStore } from "@hooks/useStores";
import { MemberList } from "@components/MemberList/MemberList";
import { TextChannelHeader } from "@components/Channel/TextChannelHeader";
import { Paper } from "@components/Paper";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";

interface Props {
  channel: Channel;
}

export const TextChannelView = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const hasWallpaper = Boolean(theme.backgroundImageUrl);

  const handleRequestEditLatest = useCallback(() => {
    if (!app.account) return;

    const latestMine = [...channel.messages.all]
      .filter((m) => m.authorId === app.account!.id && !!m.content?.trim())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestMine) return;

    channel.messages.all.forEach((m) => m.setEditing(false));
    latestMine.setEditing(true);
  }, [app.account, channel.messages.all]);

  return (
    <Stack
      direction="row"
      flex="1 1 auto"
      overflow="hidden"
      height="100%"
      minWidth={0}
    >
      <Paper
        surfaceRole={hasWallpaper ? "content" : undefined}
        elevation={0}
        direction="column"
        flex="1 1 auto"
        overflow="hidden"
        height="100%"
        borderLeft="0 !important"
        borderRight="0 !important"
        borderBottom="0 !important"
        borderRadius={0}
        minWidth={0}
      >
        <TextChannelHeader channel={channel} />
        <Stack
          direction="column"
          flex="1 1 auto"
          position="relative"
          overflow="hidden"
          minHeight={0}
          css={
            hasWallpaper
              ? {
                  paddingLeft: 12,
                  paddingRight: 14,
                  paddingBottom: 14
                }
              : undefined
          }
        >
          <MessageList channel={channel} />
          <MessageInput
            channel={channel}
            onRequestEditLatest={handleRequestEditLatest}
          />
        </Stack>
      </Paper>
      {app.memberListVisible && <MemberList />}
    </Stack>
  );
});
