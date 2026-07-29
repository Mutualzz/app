import {
  MessageSearchResultRow,
  SearchResultsList,
} from "@components/Channel/MessageSearchResultRow";
import { MessageSearchResultsHeader } from "@components/Channel/MessageSearchResultsHeader";
import { useAppStore } from "@hooks/useStores";
import type { APIMessage } from "@mutualzz/types";
import { isMessageSearchQueryReady } from "@mutualzz/validators";
import { IconSlot, Stack, Typography } from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
  query: string;
  onSelect: (messageId: string) => void;
  onQueryChange: (query: string) => void;
}

type SortOrder = "new" | "old";

export const ChannelMessageSearchResults = observer(
  ({ channel, query, onSelect, onQueryChange }: Props) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const listRef = useRef<HTMLDivElement>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("new");

    const trimmedQuery = query.trim();
    const queryReady = isMessageSearchQueryReady(trimmedQuery);

    const { data = [], isFetching } = useQuery({
      queryKey: ["channel-search", channel.id, trimmedQuery],
      enabled: queryReady,
      queryFn: () =>
        app.rest.get<APIMessage[]>(
          `channels/${channel.id}/messages/search?q=${encodeURIComponent(trimmedQuery)}`,
        ),
    });

    const sortedData = useMemo(() => {
      if (sortOrder === "new") return data;
      return [...data].reverse();
    }, [data, sortOrder]);

    useEffect(() => {
      listRef.current?.scrollTo({ top: 0 });
    }, [trimmedQuery, data.length, sortOrder]);

    const resultTitle = !queryReady
      ? t("search.hintConversationFilters")
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
          channel={channel}
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

          {sortedData.map((message) => (
            <MessageSearchResultRow
              key={message.id}
              message={message}
              space={channel.space}
              onClick={() => onSelect(message.id)}
            />
          ))}
        </SearchResultsList>
      </Stack>
    );
  },
);
