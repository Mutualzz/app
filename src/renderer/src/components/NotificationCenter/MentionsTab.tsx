import { PinnedMessageCard } from "@components/Channel/PinnedMessageCard";
import { InboxCardSkeleton, InboxListSkeleton } from "@components/Skeletons";
import { useAppStore } from "@hooks/useStores";
import { Stack, useTheme } from "@mutualzz/ui-web";
import { AtIcon } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChannelAvatar,
  channelCardTitle,
  InboxCard,
  InboxEmptyState,
  MarkAsReadButton,
  useJumpToMessage
} from "./InboxParts";
import type { MentionFilters } from "./mentionFilters";
import { mentionsQueryKey, removeMentionFromCaches } from "./mentionsCache";

const UnreadDot = () => {
  const { theme } = useTheme();
  return (
    <span
      css={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: theme.colors.primary,
        flexShrink: 0
      }}
    />
  );
};

export const MentionsTab = observer(
  ({ filters }: { filters: MentionFilters }) => {
    const app = useAppStore();
    const { t } = useTranslation("common");
    const jumpTo = useJumpToMessage();

    const activeSpace = app.spaces.active;
    const spaceId =
      !filters.allSpaces && activeSpace ? activeSpace.id : undefined;

    const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
      useInfiniteQuery({
        queryKey: mentionsQueryKey(
          filters.includeEveryone,
          filters.includeRoles,
          spaceId
        ),
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
        staleTime: Infinity,
        refetchOnWindowFocus: false
      });

    const messages = data?.pages.flatMap((page) => page.messages) ?? [];

    const dismiss = (messageId: string) => {
      removeMentionFromCaches(app.queryClient, messageId);
      void app.gateway.dismissMention(messageId);
    };

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const sentinel = loadMoreRef.current;
      if (!sentinel || !hasNextPage) return;

      const observer = new IntersectionObserver((entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          !isFetchingNextPage
        )
          void fetchNextPage();
      });
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
      <Stack direction="column" spacing={1.25}>
        {isLoading && <InboxListSkeleton label={t("notifications.loading")} />}

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
                <>
                  {!(
                    app.readStates
                      .get(message.channelId)
                      ?.isReadUpTo(message.id) ?? false
                  ) && <UnreadDot />}
                  <MarkAsReadButton
                    title={t("notifications.removeMention")}
                    onClick={() => dismiss(message.id)}
                  />
                </>
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
          <div ref={loadMoreRef}>
            <InboxCardSkeleton index={1} />
          </div>
        )}
      </Stack>
    );
  }
);
