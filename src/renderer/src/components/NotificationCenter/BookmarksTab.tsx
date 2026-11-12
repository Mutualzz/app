import { IconButton } from "@components/IconButton";
import { PinnedMessageCard } from "@components/Channel/PinnedMessageCard";
import { InboxListSkeleton } from "@components/Skeletons";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { MAX_BOOKMARKS } from "@mutualzz/validators";
import { BookmarkSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { Trans, useTranslation } from "react-i18next";
import {
  ChannelAvatar,
  channelCardTitle,
  InboxCard,
  InboxEmptyState,
  useJumpToMessage
} from "./InboxParts";

export const BookmarksTab = observer(() => {
  const app = useAppStore();
  const { t } = useTranslation("common");
  const jumpTo = useJumpToMessage();

  const { data = [], isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => app.gateway.listBookmarks(),
    staleTime: 30_000,
    enabled: app.bookmarks.size > 0
  });

  const bookmarks = data.filter((bookmark) =>
    app.bookmarks.has(bookmark.messageId)
  );

  if (app.bookmarks.size === 0)
    return (
      <InboxEmptyState
        icon={<BookmarkSimpleIcon weight="duotone" />}
        title={t("notifications.emptyBookmarksTitle")}
        description={
          <Trans
            t={t}
            i18nKey="notifications.emptyBookmarksDescription"
            components={{ bold: <b /> }}
          />
        }
      />
    );

  if (isLoading)
    return <InboxListSkeleton label={t("notifications.loading")} />;

  return (
    <Stack direction="column" spacing={1.25}>
      <Typography level="label-xs" textColor="muted">
        {t("notifications.bookmarkCount", {
          count: app.bookmarks.size,
          max: MAX_BOOKMARKS
        })}
      </Typography>
      {bookmarks.map((bookmark) => {
        const channel = app.channels.get(bookmark.channelId);
        return (
          <InboxCard
            key={bookmark.messageId}
            icon={<ChannelAvatar channel={channel} />}
            title={channelCardTitle(channel, t)}
            subtitle={channel?.space?.name}
            flush
            actions={
              <IconButton
                size={14}
                padding={6}
                variant="soft"
                color="neutral"
                title={t("notifications.removeBookmark")}
                onClick={() => void app.bookmarks.toggle(bookmark.messageId)}
              >
                <XIcon weight="bold" />
              </IconButton>
            }
          >
            <PinnedMessageCard
              message={bookmark.message}
              space={channel?.space}
              onJump={() => jumpTo(bookmark.channelId, bookmark.messageId)}
            />
          </InboxCard>
        );
      })}
    </Stack>
  );
});
