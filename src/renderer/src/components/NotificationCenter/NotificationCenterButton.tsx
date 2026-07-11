import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { ChannelIcon } from "@components/Channel/ChannelIcon";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { UserItem } from "@components/Friends/UserItem";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { Avatar, Popover, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { ChannelType, ReadStateType } from "@mutualzz/types";
import type { Channel } from "@stores/objects/Channel";
import type { AcceptedFriendNotification } from "@stores/Relationship.store";
import type { AppStore } from "@stores/App.store";
import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, TrayIcon, XIcon } from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type NotificationTab = "unreads" | "requests" | "mentions";

async function markChannelsAsRead(app: AppStore, channels: Channel[]) {
  const payload = channels
    .map((channel) => {
      const lastMessage = channel.lastMessage;
      if (!lastMessage || "status" in lastMessage) return null;

      return {
        channelId: channel.id,
        lastMessageId: lastMessage.id,
        type: ReadStateType.Messages
      };
    })
    .filter((entry) => entry !== null);

  if (!payload.length) return;

  for (const { channelId, lastMessageId } of payload) {
    app.readStates.updateLocal(channelId, lastMessageId);
  }

  await app.readStates.ackBulk(payload);
}

const MarkAsReadButton = ({
  onClick,
  disabled
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation("chat");
  return (
    <IconButton
      size={14}
      padding={4}
      variant="plain"
      disabled={disabled}
      onClick={onClick}
      title={t("contextMenu.markAsRead")}
    >
      <CheckIcon />
    </IconButton>
  );
};

const NotificationBadge = ({ count }: { count: number }) => {
  const { theme } = useTheme();
  if (count <= 0) return null;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      css={{
        minWidth: 16,
        height: 16,
        borderRadius: 9999,
        backgroundColor: theme.colors.danger,
        padding: "0 4px"
      }}
    >
      <Typography level="label-xs" css={{ color: "#fff", fontSize: 10 }}>
        {count > 99 ? "99+" : count}
      </Typography>
    </Stack>
  );
};

const AcceptedNotificationRow = observer(
  ({ notification }: { notification: AcceptedFriendNotification }) => {
    const { t } = useTranslation("common");
    const app = useAppStore();
    const user = app.users.get(notification.userId);
    if (!user) return null;

    return (
      <Paper
        p={2}
        borderRadius={6}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2} minWidth={0}>
          <UserAvatar user={user} size={32} />
          <Typography
            level="body-sm"
            css={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {t("notifications.acceptedFriend", { name: user.displayName })}
          </Typography>
        </Stack>
        <IconButton
          size={14}
          padding={4}
          variant="plain"
          onClick={(e) => {
            e.stopPropagation();
            app.relationships.dismissAcceptedNotification(notification.id);
          }}
        >
          <XIcon />
        </IconButton>
      </Paper>
    );
  }
);

const MENTION_REGEX = /<@!?(\d+)>|<@&(\d+)>|@everyone|@here/g;
const PREVIEW_MAX_CHARS = 80;

const UnreadDMChannelItem = observer(({ channel }: { channel: Channel }) => {
  const { t } = useTranslation("common");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const navigate = useNavigate();
  const readState = app.readStates.get(channel.id);
  const mentionCount = readState?.mentionCount ?? 0;
  const message = channel.lastMessage;

  const recipient = channel.dmRecipient;
  const recipients = channel.dmRecipientsList;

  const title = (() => {
    if (channel.type === ChannelType.DM)
      return recipient?.displayName ?? tChat("deletedUser");

    if (channel.name) return channel.name;

    const names = recipients.map((u) => u.displayName).filter(Boolean);

    if (!names.length) return t("notifications.groupDmChannel");
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")}, +${names.length - 2}`;
  })();

  const plainContent = message?.content?.replace(MENTION_REGEX, "").trim();
  const preview =
    plainContent && plainContent.length > PREVIEW_MAX_CHARS
      ? `${plainContent.slice(0, PREVIEW_MAX_CHARS)}…`
      : plainContent;
  const authorName = channel.isGroupDM
    ? message?.member?.displayName || message?.author?.displayName
    : undefined;

  return (
    <Paper
      p={2}
      borderRadius={6}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      css={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/@me/$channelId",
          params: { channelId: channel.id }
        });
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} minWidth={0}>
        {channel.type === ChannelType.DM ? (
          <UserAvatar
            user={recipient}
            size={32}
            badge
            showInvisible
            showOffline
          />
        ) : channel.iconUrl ? (
          <Avatar
            src={channel.iconUrl}
            size={32}
            shape={channel.flags.has("RoundedIcon") ? "circle" : "square"}
          />
        ) : (
          <DMGroupAvatar users={recipients} />
        )}
        <Stack direction="column" minWidth={0} flex={1}>
          <Typography
            level="label-sm"
            weight="medium"
            css={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {title}
          </Typography>
          <Typography
            level="body-sm"
            textColor={preview ? undefined : "muted"}
            css={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {authorName && <b>{authorName}: </b>}
            {preview ||
              (message
                ? t("notifications.sentAttachment")
                : t("notifications.noMessagesYet"))}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
        <MarkAsReadButton
          disabled={!readState?.isUnread}
          onClick={(e) => {
            e.stopPropagation();
            void readState?.ack();
          }}
        />
        <NotificationBadge count={mentionCount} />
      </Stack>
    </Paper>
  );
});

const MentionedChannelItem = observer(({ channel }: { channel: Channel }) => {
  const { t } = useTranslation("common");
  const app = useAppStore();
  const navigate = useNavigate();
  const space = channel.space;
  const readState = app.readStates.get(channel.id);
  const mentionCount = readState?.mentionCount ?? 0;
  const message = channel.lastMentionMessage;

  if (!space) return null;

  const plainContent = message?.content?.replace(MENTION_REGEX, "").trim();
  const preview =
    plainContent && plainContent.length > PREVIEW_MAX_CHARS
      ? `${plainContent.slice(0, PREVIEW_MAX_CHARS)}…`
      : plainContent;
  const authorName =
    message?.member?.displayName || message?.author?.displayName;

  return (
    <Paper
      p={2}
      borderRadius={6}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      css={{ cursor: "pointer" }}
      onClick={() => {
        navigate({
          to: "/spaces/$spaceId/$channelId",
          params: { spaceId: space.id, channelId: channel.id }
        });
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} minWidth={0}>
        <ChannelIcon type={channel.type} />
        <Stack direction="column" minWidth={0} flex={1}>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography
              level="label-xs"
              textColor="muted"
              css={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {space.name}
            </Typography>
            <Typography
              level="label-xs"
              textColor="muted"
              css={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              #{channel.name}
            </Typography>
          </Stack>
          {message ? (
            <Typography
              level="body-sm"
              css={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {authorName && <b>{authorName}: </b>}
              {preview || t("notifications.sentAttachment")}
            </Typography>
          ) : (
            <Typography
              level="body-sm"
              textColor="muted"
              css={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {t("notifications.youWereMentioned")}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
        <MarkAsReadButton
          disabled={mentionCount <= 0}
          onClick={(e) => {
            e.stopPropagation();
            void readState?.ack();
          }}
        />
        <NotificationBadge count={mentionCount} />
      </Stack>
    </Paper>
  );
});

export const NotificationCenterButton = observer(() => {
  const { t } = useTranslation("common");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const { theme } = useTheme();
  const [tab, setTab] = useState<NotificationTab>("unreads");

  const incoming = app.relationships.incoming;
  const accepted = app.relationships.acceptedNotifications;
  const unreadDMs = app.channels.unreadDMs;
  const mentionedChannels = app.channels.mentionedChannels;

  const hasRequests = incoming.length > 0 || accepted.length > 0;
  const activeTab = tab === "requests" && !hasRequests ? "unreads" : tab;

  const totalCount =
    unreadDMs.length +
    incoming.length +
    accepted.length +
    mentionedChannels.length;

  const selectTab = (next: NotificationTab) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setTab(next);
  };

  const canMarkAllAsRead =
    (activeTab === "unreads" && unreadDMs.length > 0) ||
    (activeTab === "mentions" && mentionedChannels.length > 0);

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (activeTab === "unreads") {
      void markChannelsAsRead(app, unreadDMs);
      return;
    }

    if (activeTab === "mentions") {
      void markChannelsAsRead(app, mentionedChannels);
    }
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
                css={{
                  color: "#fff",
                  fontSize: 10
                }}
              >
                {totalCount > 99 ? "99+" : totalCount}
              </Typography>
            </Stack>
          )}
        </Stack>
      }
      triggerCss={{ WebkitAppRegion: "no-drag" }}
      placement="bottom"
      closeOnClickOutside
      closeOnInteract
      variant="elevation"
      elevation={3}
      css={{
        padding: 0,
        width: 340,
        overflow: "hidden"
      }}
    >
      <Stack direction="column" width="100%">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          p={2.5}
          pb={1.5}
        >
          <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
            <Button
              size="sm"
              variant={activeTab === "unreads" ? "soft" : "plain"}
              onClick={selectTab("unreads")}
            >
              {t("notifications.unreads")}
            </Button>

            <Button
              size="sm"
              variant={activeTab === "mentions" ? "soft" : "plain"}
              onClick={selectTab("mentions")}
            >
              {t("notifications.mentions")}
            </Button>
            {hasRequests && (
              <Button
                size="sm"
                variant={activeTab === "requests" ? "soft" : "plain"}
                onClick={selectTab("requests")}
              >
                {t("notifications.requests")}
              </Button>
            )}
          </Stack>
          <Button
            size="sm"
            variant="solid"
            color="success"
            disabled={!canMarkAllAsRead}
            onClick={markAllAsRead}
          >
            {t("notifications.markAllAsRead")}
          </Button>
        </Stack>

        <Stack
          direction="column"
          width="100%"
          px={2.5}
          pb={2.5}
          spacing={1}
          css={{ maxHeight: 420, overflowY: "auto" }}
        >
          {activeTab === "unreads" &&
            (unreadDMs.length > 0 ? (
              unreadDMs.map((channel) => (
                <UnreadDMChannelItem key={channel.id} channel={channel} />
              ))
            ) : (
              <Typography
                textColor="muted"
                level="body-sm"
                css={{ textAlign: "center", padding: "24px 0" }}
              >
                {t("notifications.noUnreads")}
              </Typography>
            ))}

          {activeTab === "requests" && (
            <>
              {incoming.length > 0 && (
                <Stack direction="column" spacing={1} mb={1}>
                  <Typography level="label-sm" textColor="muted">
                    {tChat("friends.receivedCount", { count: incoming.length })}
                  </Typography>
                  {incoming.map((relationship) => (
                    <UserItem
                      key={relationship.id}
                      relationship={relationship}
                    />
                  ))}
                </Stack>
              )}
              {accepted.length > 0 && (
                <Stack direction="column" spacing={1}>
                  <Typography level="label-sm" textColor="muted">
                    {t("notifications.recentlyAccepted")}
                  </Typography>
                  {accepted.map((notification) => (
                    <AcceptedNotificationRow
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}

          {activeTab === "mentions" &&
            (mentionedChannels.length > 0 ? (
              mentionedChannels.map((channel) => (
                <MentionedChannelItem key={channel.id} channel={channel} />
              ))
            ) : (
              <Typography
                textColor="muted"
                level="body-sm"
                css={{ textAlign: "center", padding: "24px 0" }}
              >
                {t("notifications.noMentions")}
              </Typography>
            ))}
        </Stack>
      </Stack>
    </Popover>
  );
});
