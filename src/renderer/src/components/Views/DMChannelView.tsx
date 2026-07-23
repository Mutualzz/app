import { Paper } from "@components/Paper";
import { DMChannelHeader } from "@components/DMChannel/DMChannelHeader";
import { DMCallView } from "@components/DMChannel/DMCallView";
import { DMGroupMemberList } from "@components/DMChannel/DMGroupMemberList";
import { MessageList } from "@components/Message/MessageList";
import {
  MessageInput,
  type MessageInputHandle
} from "@components/Message/MessageInput";
import { ChannelFileDropZone } from "@components/Channel/ChannelFileDropZone";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

export const DMChannelView = observer(() => {
  const app = useAppStore();
  const { theme } = useTheme();
  const channel = app.channels.active;
  const hasWallpaper = Boolean(theme.backgroundImageUrl);
  const messageInputRef = useRef<MessageInputHandle>(null);
  const [callExpanded, setCallExpanded] = useState(true);
  const callActive = !!channel && app.calls.isActive(channel.id);
  const ringingForMe = !!channel && app.calls.isRingingForMe(channel.id);
  const outgoing = !!channel && app.calls.isOutgoing(channel.id);

  useEffect(() => {
    if (callActive || ringingForMe || outgoing) setCallExpanded(true);
  }, [callActive, ringingForMe, outgoing, channel?.id]);

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
      <Paper
        elevation={app.settings?.preferEmbossed ? 5 : 0}
        p={0}
        direction="column"
        borderLeft="0 !important"
        borderRight="0 !important"
        borderTop="0 !important"
        boxShadow="0 !important"
        overflow="hidden"
        css={{ flexShrink: 0 }}
      >
        <DMChannelHeader
          channel={channel}
          callExpanded={callExpanded}
          onToggleCallExpanded={
            callActive ? () => setCallExpanded((v) => !v) : undefined
          }
        />
        {callActive && callExpanded && <DMCallView channel={channel} />}
      </Paper>
      <Stack direction="row" flex="1 1 auto" overflow="hidden" minHeight={0}>
        <Paper
          surfaceRole={hasWallpaper ? "content" : undefined}
          elevation={0}
          direction="column"
          flex="1 1 auto"
          position="relative"
          overflow="hidden"
          minHeight={0}
          minWidth={0}
          borderLeft="0 !important"
          borderRight="0 !important"
          borderBottom="0 !important"
          borderRadius={0}
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
          <ChannelFileDropZone
            channel={channel}
            onDropFiles={(files) => messageInputRef.current?.addFiles(files)}
          >
            <MessageList channel={channel} />
            <MessageInput
              key={channel.id}
              ref={messageInputRef}
              channel={channel}
              onRequestEditLatest={handleRequestEditLatest}
            />
          </ChannelFileDropZone>
        </Paper>
        {app.memberListVisible && channel.type === ChannelType.GroupDM && (
          <DMGroupMemberList />
        )}
      </Stack>
    </Stack>
  );
});
