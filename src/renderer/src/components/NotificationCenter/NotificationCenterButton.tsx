import { IconButton } from "@components/IconButton";
import { useAppStore } from "@hooks/useStores";
import {
  Divider,
  Popover,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { SlidersHorizontalIcon, TrayIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { BookmarksTab } from "./BookmarksTab";
import {
  markChannelsAsRead,
  MentionedChannelItem,
  UnreadDMChannelItem
} from "./ChannelInboxItems";
import { ForYouTab } from "./ForYouTab";
import {
  CountBadge,
  INBOX_WIDTH_PX,
  InboxEmptyState,
  type InboxTab,
  InboxTabButton,
  MarkAsReadButton
} from "./InboxParts";
import { MentionFilterMenu } from "./MentionFilterMenu";
import { MentionsTab } from "./MentionsTab";
import { clearMentionCaches } from "./mentionsCache";
import {
  isDefaultMentionFilters,
  type MentionFilters,
  readMentionFilters,
  writeMentionFilters
} from "./mentionFilters";
import { RemindersTab } from "./RemindersTab";
import { ScheduledTab } from "./ScheduledTab";

export const NotificationCenterButton = observer(() => {
  const { t } = useTranslation("common");
  const app = useAppStore();
  const { theme } = useTheme();
  const [tab, setTab] = useState<InboxTab>("forYou");
  const [open, setOpen] = useState(false);
  const [mentionFilters, setMentionFilters] = useState(readMentionFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterAnchorRef = useRef<HTMLDivElement>(null);

  const updateMentionFilters = (changes: Partial<MentionFilters>) => {
    const next = { ...mentionFilters, ...changes };
    setMentionFilters(next);
    writeMentionFilters(next);
  };
  const navigate = useNavigate();

  useEffect(() => {
    app.desktopNotifications.setNavigator(navigate);
    return () => app.desktopNotifications.setNavigator(null);
  }, [app.desktopNotifications, navigate]);

  useEffect(() => {
    const requested = app.inboxRequestedTab;
    if (!requested) return;
    setTab(requested);
    setOpen(true);
    app.clearInboxRequest();
  }, [app, app.inboxRequestedTab]);

  const incoming = app.relationships.incoming;
  const unreadDMs = app.channels.unreadDMs;
  const mentionedChannels = app.channels.mentionedChannels;

  const forYouCount = incoming.length + app.notifications.unreadCount;

  const totalCount = unreadDMs.length + mentionedChannels.length + forYouCount;

  const tabs: { key: InboxTab; label: string; count: number }[] = [
    { key: "forYou", label: t("notifications.forYou"), count: forYouCount },
    {
      key: "unreads",
      label: t("notifications.unreads"),
      count: unreadDMs.length + mentionedChannels.length
    },
    {
      key: "mentions",
      label: t("notifications.mentions"),
      count: 0
    },
    { key: "bookmarks", label: t("notifications.bookmarks"), count: 0 },
    {
      key: "reminders",
      label: t("notifications.reminders"),
      count: app.reminders.dueCount
    },
    {
      key: "scheduled",
      label: t("notifications.scheduled"),
      count: app.scheduledMessages.failedCount
    }
  ];

  const markableChannels =
    tab === "unreads" ? [...unreadDMs, ...mentionedChannels] : [];
  const showMarkAll = tab === "unreads" || tab === "mentions";

  const markAllAsRead = (event: MouseEvent) => {
    event.stopPropagation();
    if (tab === "mentions") {
      clearMentionCaches(app.queryClient);
      void app.gateway.clearAllMentions();
      return;
    }
    void markChannelsAsRead(app, markableChannels);
  };

  return (
    <Popover
      trigger={
        <Stack position="relative">
          <IconButton
            variant="plain"
            padding={4}
            css={{ WebkitAppRegion: "no-drag" }}
          >
            <TrayIcon weight={totalCount > 0 ? "fill" : "regular"} />
          </IconButton>
          {totalCount > 0 && (
            <Stack
              alignItems="center"
              justifyContent="center"
              css={{
                position: "absolute",
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 9999,
                backgroundColor: theme.colors.danger,
                padding: "0 4px",
                pointerEvents: "none"
              }}
            >
              <Typography
                level="label-xs"
                css={{ color: "#fff", fontSize: 10 }}
              >
                {totalCount > 99 ? "99+" : totalCount}
              </Typography>
            </Stack>
          )}
        </Stack>
      }
      triggerCss={{ WebkitAppRegion: "no-drag" }}
      isOpen={open}
      onOpenChange={setOpen}
      placement="bottom"
      closeOnClickOutside
      closeOnInteract
      align="end"
      variant="elevation"
      elevation={3}
      css={{
        padding: 0,
        width: `min(${INBOX_WIDTH_PX}px, calc(100vw - 16px))`,
        maxHeight: "min(80vh, 760px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        whiteSpace: "normal",
        borderRadius: 12
      }}
    >
      <Stack direction="column" width="100%" flex={1} minHeight={0}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          px={3}
          pt={2.5}
          pb={1.5}
          flexShrink={0}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <TrayIcon size={22} weight="fill" />
            <Typography level="h6" fontWeight="bold">
              {t("notifications.inbox")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {tab === "mentions" && (
              <div ref={filterAnchorRef} css={{ position: "relative" }}>
                <IconButton
                  size={14}
                  padding={6}
                  variant={
                    filtersOpen || !isDefaultMentionFilters(mentionFilters)
                      ? "solid"
                      : "soft"
                  }
                  color={
                    filtersOpen || !isDefaultMentionFilters(mentionFilters)
                      ? "primary"
                      : "neutral"
                  }
                  title={t("notifications.filterTitle")}
                  onClick={(event) => {
                    event.stopPropagation();
                    setFiltersOpen(!filtersOpen);
                  }}
                >
                  <SlidersHorizontalIcon weight="bold" />
                </IconButton>
                {filtersOpen && (
                  <MentionFilterMenu
                    filters={mentionFilters}
                    anchorRef={filterAnchorRef}
                    onChange={updateMentionFilters}
                    onClose={() => setFiltersOpen(false)}
                  />
                )}
              </div>
            )}
            {showMarkAll && (
              <MarkAsReadButton
                title={
                  tab === "mentions"
                    ? t("notifications.clearAllMentions")
                    : t("notifications.markAllAsRead")
                }
                disabled={tab === "unreads" && markableChannels.length === 0}
                onClick={markAllAsRead}
              />
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          px={2}
          pb={1.25}
          flexShrink={0}
          css={{ overflowX: "auto", scrollbarWidth: "none" }}
        >
          {tabs.map((entry) => {
            const isActive = tab === entry.key;
            return (
              <InboxTabButton
                key={entry.key}
                type="button"
                data-active={isActive ? "true" : "false"}
                onClick={(event) => {
                  event.stopPropagation();
                  setTab(entry.key);
                }}
              >
                <Typography
                  level="label-sm"
                  textColor={isActive ? undefined : "muted"}
                  weight="medium"
                  css={{ whiteSpace: "nowrap" }}
                >
                  {entry.label}
                </Typography>
                <CountBadge count={entry.count} />
              </InboxTabButton>
            );
          })}
        </Stack>
        <Divider css={{ opacity: 0.5, flexShrink: 0 }} />

        <Stack
          direction="column"
          width="100%"
          px={2.5}
          py={2}
          spacing={1.25}
          flex={1}
          minHeight={0}
          css={{ overflowY: "auto", overflowX: "hidden" }}
        >
          {tab === "forYou" && <ForYouTab onSelectTab={setTab} />}

          {tab === "unreads" &&
            (unreadDMs.length + mentionedChannels.length > 0 ? (
              <>
                {unreadDMs.map((channel) => (
                  <UnreadDMChannelItem key={channel.id} channel={channel} />
                ))}
                {mentionedChannels.map((channel) => (
                  <MentionedChannelItem key={channel.id} channel={channel} />
                ))}
              </>
            ) : (
              <InboxEmptyState
                icon={<TrayIcon weight="duotone" />}
                title={t("notifications.emptyUnreadsTitle")}
                description={t("notifications.emptyUnreadsDescription")}
              />
            ))}

          {tab === "mentions" && <MentionsTab filters={mentionFilters} />}

          {tab === "bookmarks" && <BookmarksTab />}
          {tab === "reminders" && <RemindersTab />}
          {tab === "scheduled" && <ScheduledTab />}
        </Stack>
      </Stack>
    </Popover>
  );
});
