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
import { ChannelMessageSearchResults } from "@components/Channel/ChannelMessageSearchResults";
import { commitSearchFilterChange } from "@components/Channel/messageSearch.utils";
import { SEARCH_PANEL_WIDTH_PX } from "@components/Channel/ChannelSearchResults";
import { useAppStore } from "@hooks/useStores";
import { isMessageSearchQueryReady } from "@mutualzz/validators";
import { ChannelType } from "@mutualzz/types";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const DMChannelView = observer(() => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");
  const channel = app.channels.active;
  const hasWallpaper = Boolean(theme.backgroundImageUrl);
  const messageInputRef = useRef<MessageInputHandle>(null);
  const [callExpanded, setCallExpanded] = useState(true);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const callActive = !!channel && app.calls.isActive(channel.id);
  const ringingForMe = !!channel && app.calls.isRingingForMe(channel.id);
  const outgoing = !!channel && app.calls.isOutgoing(channel.id);

  const resetSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchDraft("");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    resetSearch();
  }, [channel?.id, resetSearch]);

  useEffect(() => {
    if (callActive || ringingForMe || outgoing) setCallExpanded(true);
  }, [callActive, ringingForMe, outgoing, channel?.id]);

  const handleSearchSubmit = useCallback(() => {
    const query = searchDraft.trim();
    if (!isMessageSearchQueryReady(query)) return;
    setSearchQuery(query);
  }, [searchDraft]);

  const handleSearchFilterChange = useCallback(
    (value: string) =>
      commitSearchFilterChange(value, setSearchDraft, setSearchQuery),
    []
  );

  const handleSearchDraftChange = useCallback((value: string) => {
    setSearchDraft(value);
  }, []);

  const handleSearchSelect = useCallback(
    (messageId: string) => {
      if (!channel) return;
      resetSearch();
      app.requestJumpToMessage(channel.id, messageId);
    },
    [app, channel, resetSearch]
  );

  const handleRequestEditLatest = useCallback(() => {
    if (!app.account || !channel) return;

    const latestMine = [...channel.messages.all]
      .filter((m) => m.authorId === app.account!.id && !!m.content?.trim())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!latestMine) return;

    channel.messages.all.forEach((m) => m.setEditing(false));
    latestMine.setEditing(true);
  }, [app.account, channel]);

  const showSearchResults = isMessageSearchQueryReady(searchQuery.trim());

  if (!channel) return null;

  const searchScopeName = channel.isGroupDM
    ? channel.name ||
      channel.dmRecipients
        .map((user) => user.displayName)
        .filter(Boolean)
        .join(", ") ||
      t("groupDm.title")
    : (channel.dmRecipient?.displayName ?? t("deletedUser"));

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
          searchExpanded={searchExpanded}
          searchDraft={searchDraft}
          searchSubmitted={showSearchResults}
          searchScopeName={searchScopeName}
          onSearchExpand={() => setSearchExpanded(true)}
          onSearchDraftChange={handleSearchDraftChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClose={resetSearch}
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
        {showSearchResults ? (
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
            <ChannelMessageSearchResults
              channel={channel}
              query={searchQuery}
              onSelect={handleSearchSelect}
              onQueryChange={handleSearchFilterChange}
            />
          </Paper>
        ) : (
          app.memberListVisible &&
          channel.type === ChannelType.GroupDM && <DMGroupMemberList />
        )}
      </Stack>
    </Stack>
  );
});
