import { Button } from "@components/Button";
import { PinnedMessageCard } from "@components/Channel/PinnedMessageCard";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { AtIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChannelAvatar,
  channelCardTitle,
  InboxCard,
  InboxEmptyState,
  MarkAsReadButton,
  useJumpToMessage
} from "./InboxParts";
import { type MentionsData, removeMentionFromCache } from "./mentionsCache";

const FILTER_STORAGE_KEY = "inbox:mentionFilters";

interface MentionFilters {
  includeEveryone: boolean;
  includeRoles: boolean;
  allSpaces: boolean;
}

const DEFAULT_FILTERS: MentionFilters = {
  includeEveryone: true,
  includeRoles: true,
  allSpaces: true
};

const readFilters = (): MentionFilters => {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    return raw ? { ...DEFAULT_FILTERS, ...JSON.parse(raw) } : DEFAULT_FILTERS;
  } catch {
    return DEFAULT_FILTERS;
  }
};

const writeFilters = (filters: MentionFilters) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    return;
  }
};

const FilterChip = ({
  active,
  label,
  onToggle
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
}) => (
  <Button
    size="sm"
    variant={active ? "soft" : "plain"}
    color={active ? "primary" : "neutral"}
    onClick={(event) => {
      event.stopPropagation();
      onToggle();
    }}
  >
    {label}
  </Button>
);

export const MentionsTab = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("common");
  const jumpTo = useJumpToMessage();
  const [filters, setFilters] = useState(readFilters);

  const activeSpace = app.spaces.active;
  const spaceId =
    !filters.allSpaces && activeSpace ? activeSpace.id : undefined;

  const updateFilters = (changes: Partial<MentionFilters>) => {
    const next = { ...filters, ...changes };
    setFilters(next);
    writeFilters(next);
  };

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        "mentions",
        filters.includeEveryone,
        filters.includeRoles,
        spaceId ?? "all"
      ],
      queryFn: ({ pageParam }) =>
        app.gateway.listMentions({
          before: pageParam,
          includeEveryone: filters.includeEveryone,
          includeRoles: filters.includeRoles,
          spaceId
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? (lastPage.nextBefore ?? undefined) : undefined,
      staleTime: 30_000
    });

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  const dismiss = (messageId: string) => {
    app.queryClient.setQueriesData<MentionsData>(
      { queryKey: ["mentions"] },
      (current) => removeMentionFromCache(current, messageId)
    );
    void app.gateway.dismissMention(messageId);
  };

  return (
    <Stack direction="column" spacing={1.25}>
      <Stack direction="row" spacing={0.75} flexWrap="wrap">
        <FilterChip
          active={filters.includeEveryone}
          label={t("notifications.filterEveryone")}
          onToggle={() =>
            updateFilters({ includeEveryone: !filters.includeEveryone })
          }
        />
        <FilterChip
          active={filters.includeRoles}
          label={t("notifications.filterRoles")}
          onToggle={() =>
            updateFilters({ includeRoles: !filters.includeRoles })
          }
        />
        {activeSpace && (
          <FilterChip
            active={!filters.allSpaces}
            label={t("notifications.filterThisSpace", {
              space: activeSpace.name
            })}
            onToggle={() => updateFilters({ allSpaces: !filters.allSpaces })}
          />
        )}
      </Stack>

      {isLoading && (
        <Typography level="body-sm" textColor="muted" textAlign="center" py={3}>
          {t("notifications.loading")}
        </Typography>
      )}

      {!isLoading && messages.length === 0 && (
        <InboxEmptyState
          icon={<AtIcon weight="duotone" />}
          title={t("notifications.emptyMentionsTitle")}
          description={t("notifications.emptyMentionsDescription")}
        />
      )}

      {messages.map((message) => {
        const channel = app.channels.get(message.channelId);
        return (
          <InboxCard
            key={message.id}
            icon={<ChannelAvatar channel={channel} />}
            title={channelCardTitle(channel, t)}
            subtitle={channel?.space?.name}
            flush
            actions={
              <MarkAsReadButton
                title={t("notifications.removeMention")}
                onClick={() => dismiss(message.id)}
              />
            }
          >
            <PinnedMessageCard
              message={message}
              space={channel?.space}
              onJump={() => jumpTo(message.channelId, message.id)}
            />
          </InboxCard>
        );
      })}

      {hasNextPage && (
        <Button
          size="sm"
          variant="plain"
          disabled={isFetchingNextPage}
          onClick={(event) => {
            event.stopPropagation();
            void fetchNextPage();
          }}
        >
          {t("notifications.loadMore")}
        </Button>
      )}
    </Stack>
  );
});
