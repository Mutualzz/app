import {
  MessageSearchResultRow,
  SearchChannelGroupHeader,
  SearchResultsList,
} from "@components/Channel/MessageSearchResultRow";
import { MessageSearchResultsHeader } from "@components/Channel/MessageSearchResultsHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage } from "@mutualzz/types";
import { isMessageSearchQueryReady } from "@mutualzz/validators";
import { IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import { useQuery } from "@tanstack/react-query";
import { FolderIcon, HashIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  space: Space;
  query: string;
  onSelect: (channelId: string, messageId: string) => void;
  onQueryChange: (query: string) => void;
}

const SEARCH_PANEL_WIDTH = 480;

export const SEARCH_PANEL_WIDTH_PX = SEARCH_PANEL_WIDTH;

type SortOrder = "new" | "old";

function groupMessagesByChannel(messages: APIMessage[]) {
  const groups: {
    channelId: string;
    channelName: string;
    categoryName: string | null;
    messages: APIMessage[];
  }[] = [];
  const indexByChannel = new Map<string, number>();

  for (const message of messages) {
    const channelId = message.channelId;
    const existingIndex = indexByChannel.get(channelId);

    if (existingIndex == null) {
      indexByChannel.set(channelId, groups.length);
      groups.push({
        channelId,
        channelName: message.channel?.name ?? channelId,
        categoryName: message.channel?.parent?.name ?? null,
        messages: [message],
      });
      continue;
    }

    groups[existingIndex].messages.push(message);
  }

  return groups;
}

export const ChannelSearchResults = observer(({ space, query, onSelect, onQueryChange }: Props) => {
  const app = useAppStore();
  const { t } = useTranslation("chat");
  const listRef = useRef<HTMLDivElement>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("new");

  const trimmedQuery = query.trim();
  const queryReady = isMessageSearchQueryReady(trimmedQuery);

  const { data = [], isFetching } = useQuery({
    queryKey: ["space-search", space.id, trimmedQuery],
    enabled: queryReady,
    queryFn: () =>
      app.rest.get<APIMessage[]>(
        `spaces/${space.id}/messages/search?q=${encodeURIComponent(trimmedQuery)}`,
      ),
  });

  const sortedData = useMemo(() => {
    if (sortOrder === "new") return data;
    return [...data].reverse();
  }, [data, sortOrder]);

  const groups = useMemo(() => groupMessagesByChannel(sortedData), [sortedData]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [trimmedQuery, data.length, sortOrder]);

  const resultTitle = !queryReady
    ? t("search.hintFilters")
    : isFetching
      ? t("search.searching")
      : t("search.resultsTitle", { count: data.length });

  const sortLabel =
    sortOrder === "new" ? t("search.sortNewest") : t("search.sortOldest");

  return (
    <Stack direction="column" height="100%" minHeight={0} overflow="hidden">
      <MessageSearchResultsHeader
        title={resultTitle}
        query={trimmedQuery}
        onQueryChange={onQueryChange}
        space={space}
        showSort={queryReady && data.length > 0 && !isFetching}
        sortLabel={sortLabel}
        onToggleSort={() => setSortOrder((current) => (current === "new" ? "old" : "new"))}
        isSearching={isFetching}
      />

      <SearchResultsList ref={listRef} direction="column">
        {queryReady && !isFetching && data.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" py={5} spacing={1}>
            <IconSlot size={28} css={{ opacity: 0.35 }}>
              <MagnifyingGlassIcon weight="bold" />
            </IconSlot>
            <Typography level="body-sm" textColor="muted" textAlign="center">
              {t("search.empty")}
            </Typography>
          </Stack>
        ) : null}

        {groups.map((group) => (
          <Stack key={group.channelId} direction="column" spacing={0.75}>
            <SearchChannelGroupHeader>
              <Stack direction="row" alignItems="center" spacing={0.5} minWidth={0}>
                <IconSlot size={14} css={{ opacity: 0.7 }}>
                  <HashIcon weight="bold" />
                </IconSlot>
                <Typography
                  level="label-sm"
                  weight="bold"
                  css={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.channelName}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
                <IconSlot size={13} css={{ opacity: 0.55 }}>
                  <FolderIcon weight="fill" />
                </IconSlot>
                <Typography level="body-xs" textColor="muted">
                  {group.categoryName ?? t("search.textChannels")}
                </Typography>
              </Stack>
            </SearchChannelGroupHeader>

            <Stack direction="column" spacing={0.75}>
              {group.messages.map((message) => (
                <MessageSearchResultRow
                  key={message.id}
                  message={message}
                  space={space}
                  onClick={() => onSelect(message.channelId, message.id)}
                />
              ))}
            </Stack>
          </Stack>
        ))}
      </SearchResultsList>
    </Stack>
  );
});
