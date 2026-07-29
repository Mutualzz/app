import { commitSearchFilterChange } from "@components/Channel/messageSearch.utils";
import type { Channel } from "@stores/objects/Channel";
import { isMessageSearchQueryReady } from "@mutualzz/validators";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList";
import {
  MessageInput,
  type MessageInputHandle
} from "@components/Message/MessageInput";
import { useAppStore } from "@hooks/useStores";
import { MemberList } from "@components/MemberList/MemberList";
import { TextChannelHeader } from "@components/Channel/TextChannelHeader";
import {
  ChannelSearchResults,
  SEARCH_PANEL_WIDTH_PX,
} from "@components/Channel/ChannelSearchResults";
import { ChannelFileDropZone } from "@components/Channel/ChannelFileDropZone";
import { Paper } from "@components/Paper";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  channel: Channel;
}

export const TextChannelView = observer(({ channel }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const hasWallpaper = Boolean(theme.backgroundImageUrl);
  const messageInputRef = useRef<MessageInputHandle>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const space = channel.space;

  const resetSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchDraft("");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    resetSearch();
  }, [channel.id, resetSearch]);

  const handleRequestEditLatest = useCallback(() => {
    if (!app.account) return;

    const latestMine = [...channel.messages.all]
      .filter((m) => m.authorId === app.account!.id && !!m.content?.trim())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestMine) return;

    channel.messages.all.forEach((m) => m.setEditing(false));
    latestMine.setEditing(true);
  }, [app.account, channel.messages.all]);

  const handleSearchSubmit = useCallback(() => {
    const query = searchDraft.trim();
    if (!isMessageSearchQueryReady(query)) return;
    setSearchQuery(query);
  }, [searchDraft]);

  const handleSearchFilterChange = useCallback(
    (value: string) => commitSearchFilterChange(value, setSearchDraft, setSearchQuery),
    [],
  );

  const handleSearchDraftChange = useCallback((value: string) => {
    setSearchDraft(value);
  }, []);

  const handleSearchSelect = useCallback(
    (targetChannelId: string, messageId: string) => {
      resetSearch();
      app.requestJumpToMessage(targetChannelId, messageId);

      if (targetChannelId !== channel.id && space) {
        navigate({
          to: "/spaces/$spaceId/$channelId",
          params: { spaceId: space.id, channelId: targetChannelId },
        });
      }
    },
    [app, channel.id, navigate, resetSearch, space],
  );

  const showSearchResults =
    isMessageSearchQueryReady(searchQuery.trim()) && Boolean(space);

  return (
    <Stack
      direction="column"
      flex="1 1 auto"
      overflow="hidden"
      height="100%"
      minWidth={0}
    >
      <TextChannelHeader
        channel={channel}
        searchExpanded={searchExpanded}
        searchDraft={searchDraft}
        searchSubmitted={showSearchResults}
        onSearchExpand={() => setSearchExpanded(true)}
        onSearchDraftChange={handleSearchDraftChange}
        onSearchSubmit={handleSearchSubmit}
        onSearchClose={resetSearch}
      />
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
        {showSearchResults && space ? (
          <Paper
            surfaceRole="chrome"
            elevation={0}
            direction="column"
            flex={`0 0 ${SEARCH_PANEL_WIDTH_PX}px`}
            overflow="hidden"
            minHeight={0}
            borderTop="0 !important"
            borderRight="0 !important"
            borderBottom="0 !important"
          >
            <ChannelSearchResults
              space={space}
              query={searchQuery}
              onSelect={handleSearchSelect}
              onQueryChange={handleSearchFilterChange}
            />
          </Paper>
        ) : (
          app.memberListVisible && <MemberList />
        )}
      </Stack>
    </Stack>
  );
});
