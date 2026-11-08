import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { UserItem } from "@components/Friends/UserItem";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { APINotification } from "@mutualzz/types";
import { styled } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  AlarmIcon,
  BellIcon,
  PaperPlaneTiltIcon,
  WarningCircleIcon,
  XIcon
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  channelLocationLabel,
  formatInboxTime,
  InboxEmptyState,
  type InboxTab,
  useJumpToMessage
} from "./InboxParts";

const EntryRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  borderRadius: 8,
  transition: "background 120ms ease",

  "&[data-clickable='true']": {
    cursor: "pointer"
  },

  "&:hover": {
    background: theme.colors.surface
  }
}));

const IconBubble = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      css={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        flexShrink: 0,
        background: theme.colors.surface,
        color: theme.colors.primary,
        fontSize: 18
      }}
    >
      {children}
    </Stack>
  );
};

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Typography
    level="label-xs"
    textColor="muted"
    weight="bold"
    css={{ textTransform: "uppercase", letterSpacing: 0.4, padding: "0 12px" }}
  >
    {children}
  </Typography>
);

const NotificationEntry = observer(
  ({
    notification,
    isNew,
    onSelectTab
  }: {
    notification: APINotification;
    isNew: boolean;
    onSelectTab: (tab: InboxTab) => void;
  }) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("common");
    const jumpTo = useJumpToMessage();

    const location = notification.channelId
      ? channelLocationLabel(app.channels.get(notification.channelId), t)
      : "";
    const actor = notification.actorId
      ? app.users.get(notification.actorId)
      : undefined;

    const content = ((): {
      leading: ReactNode;
      text: string;
      onOpen?: () => void;
    } | null => {
      switch (notification.type) {
        case "friend_accepted":
          if (!actor) return null;
          return {
            leading: <UserAvatar user={actor} size={32} />,
            text: t("notifications.acceptedFriend", {
              name: actor.displayName
            })
          };
        case "reminder":
          return {
            leading: (
              <IconBubble>
                <AlarmIcon weight="fill" />
              </IconBubble>
            ),
            text: t("notifications.reminderEntry", { location }),
            onOpen: () =>
              notification.channelId &&
              jumpTo(
                notification.channelId,
                notification.messageId ?? undefined
              )
          };
        case "scheduled_sent":
          return {
            leading: (
              <IconBubble>
                <PaperPlaneTiltIcon weight="fill" />
              </IconBubble>
            ),
            text: t("notifications.scheduledSentEntry", { location }),
            onOpen: () =>
              notification.channelId &&
              jumpTo(
                notification.channelId,
                notification.messageId ?? undefined
              )
          };
        case "scheduled_failed":
          return {
            leading: (
              <IconBubble>
                <WarningCircleIcon weight="fill" />
              </IconBubble>
            ),
            text: t("notifications.scheduledFailedEntry", {
              location,
              reason: notification.data.reason ?? ""
            }),
            onOpen: () => onSelectTab("scheduled")
          };
      }
    })();

    if (!content) return null;

    return (
      <EntryRow
        data-clickable={content.onOpen ? "true" : "false"}
        onClick={content.onOpen}
      >
        {content.leading}
        <Typography
          level="body-sm"
          css={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}
        >
          {content.text}
        </Typography>
        <Typography level="body-xs" textColor="muted" flexShrink={0}>
          {formatInboxTime(notification.createdAt)}
        </Typography>
        {isNew && (
          <span
            css={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: theme.colors.primary,
              flexShrink: 0
            }}
          />
        )}
        <IconButton
          size={12}
          padding={4}
          variant="plain"
          title={t("notifications.dismiss")}
          onClick={(event) => {
            event.stopPropagation();
            app.notifications.dismiss(notification.id);
          }}
        >
          <XIcon />
        </IconButton>
      </EntryRow>
    );
  }
);

export const ForYouTab = observer(
  ({ onSelectTab }: { onSelectTab: (tab: InboxTab) => void }) => {
    const app = useAppStore();
    const { t } = useTranslation("common");
    const [newIds] = useState(
      () =>
        new Set(
          app.notifications.all
            .filter((notification) => !notification.readAt)
            .map((notification) => notification.id)
        )
    );

    useEffect(() => {
      if (!app.notifications.loaded) void app.notifications.load();
    }, [app.notifications]);

    useEffect(() => {
      app.notifications.markAllRead();
    }, [app.notifications, app.notifications.unreadCount]);

    const incoming = app.relationships.incoming;
    const notifications = app.notifications.all;

    for (const notification of notifications)
      if (!notification.readAt) newIds.add(notification.id);

    if (
      incoming.length === 0 &&
      notifications.length === 0 &&
      app.notifications.loaded
    )
      return (
        <InboxEmptyState
          icon={<BellIcon weight="duotone" />}
          title={t("notifications.emptyForYouTitle")}
          description={t("notifications.emptyForYouDescription")}
        />
      );

    const startOfToday = dayjs().startOf("day").valueOf();
    const todayNotifications = notifications.filter(
      (notification) =>
        new Date(notification.createdAt).getTime() >= startOfToday
    );
    const earlierNotifications = notifications.filter(
      (notification) =>
        new Date(notification.createdAt).getTime() < startOfToday
    );

    const renderNotification = (notification: APINotification) => (
      <NotificationEntry
        key={notification.id}
        notification={notification}
        isNew={newIds.has(notification.id)}
        onSelectTab={onSelectTab}
      />
    );

    return (
      <Stack direction="column" spacing={2}>
        {incoming.length > 0 && (
          <Stack direction="column" spacing={1}>
            <SectionLabel>{t("notifications.friendRequests")}</SectionLabel>
            {incoming.map((relationship) => (
              <UserItem key={relationship.id} relationship={relationship} />
            ))}
          </Stack>
        )}
        {!app.notifications.loaded && (
          <Typography
            level="body-sm"
            textColor="muted"
            textAlign="center"
            py={3}
          >
            {t("notifications.loading")}
          </Typography>
        )}
        {todayNotifications.length > 0 && (
          <Stack direction="column" spacing={0.25}>
            <SectionLabel>{t("notifications.today")}</SectionLabel>
            {todayNotifications.map(renderNotification)}
          </Stack>
        )}
        {earlierNotifications.length > 0 && (
          <Stack direction="column" spacing={0.25}>
            <SectionLabel>{t("notifications.earlier")}</SectionLabel>
            {earlierNotifications.map(renderNotification)}
          </Stack>
        )}
        {app.notifications.hasMore && (
          <Button
            size="sm"
            variant="plain"
            disabled={app.notifications.loading}
            onClick={(event) => {
              event.stopPropagation();
              void app.notifications.loadMore();
            }}
          >
            {t("notifications.loadMore")}
          </Button>
        )}
      </Stack>
    );
  }
);
