import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { ChannelType, ReadStateType } from "@mutualzz/types";
import { Avatar, Stack, Typography } from "@mutualzz/ui-web";
import type { AppStore } from "@stores/App.store";
import type { Channel } from "@stores/objects/Channel";
import type { Message } from "@stores/objects/Message";
import type { QueuedMessage } from "@stores/objects/QueuedMessage";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import {
  CountBadge,
  ellipsis,
  formatInboxTime,
  InboxCard,
  MarkAsReadButton,
  useJumpToMessage
} from "./InboxParts";

const MENTION_REGEX = /<@!?(\d+)>|<@&(\d+)>|@everyone|@here/g;
const PREVIEW_MAX_CHARS = 280;

export async function markChannelsAsRead(app: AppStore, channels: Channel[]) {
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

const MessagePreviewBody = observer(
  ({ message }: { message: Message | QueuedMessage | null | undefined }) => {
    const { t } = useTranslation("common");

    if (!message)
      return (
        <Typography level="body-sm" textColor="muted">
          {t("notifications.noMessagesYet")}
        </Typography>
      );

    const authorName =
      ("member" in message ? message.member?.displayName : undefined) ||
      message.author?.displayName;
    const plainContent = message.content?.replace(MENTION_REGEX, "").trim();
    const preview =
      plainContent && plainContent.length > PREVIEW_MAX_CHARS
        ? `${plainContent.slice(0, PREVIEW_MAX_CHARS)}…`
        : plainContent;

    return (
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <UserAvatar user={message.author ?? undefined} size={32} />
        <Stack direction="column" minWidth={0} flex={1}>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography level="label-sm" weight="bold" css={ellipsis}>
              {authorName}
            </Typography>
            <Typography level="body-xs" textColor="muted" flexShrink={0}>
              {formatInboxTime(message.createdAt)}
            </Typography>
          </Stack>
          <Typography
            level="body-sm"
            textColor={preview ? undefined : "muted"}
            css={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word"
            }}
          >
            {preview || t("notifications.sentAttachment")}
          </Typography>
        </Stack>
      </Stack>
    );
  }
);

export const UnreadDMChannelItem = observer(
  ({ channel }: { channel: Channel }) => {
    const { t } = useTranslation("common");
    const { t: tChat } = useTranslation("chat");
    const app = useAppStore();
    const jumpTo = useJumpToMessage();
    const readState = app.readStates.get(channel.id);
    const mentionCount = readState?.mentionCount ?? 0;

    const recipient = channel.dmRecipient;
    const recipients = channel.dmRecipientsList;

    const title = (() => {
      if (channel.type === ChannelType.DM)
        return recipient?.displayName ?? tChat("deletedUser");

      if (channel.name) return channel.name;

      const names = recipients.map((user) => user.displayName).filter(Boolean);

      if (!names.length) return t("notifications.groupDmChannel");
      if (names.length <= 2) return names.join(", ");
      return `${names.slice(0, 2).join(", ")}, +${names.length - 2}`;
    })();

    const icon =
      channel.type === ChannelType.DM ? (
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
      );

    return (
      <InboxCard
        icon={icon}
        title={title}
        subtitle={
          channel.type === ChannelType.DM
            ? t("notifications.directMessage")
            : t("notifications.groupDmChannel")
        }
        onOpen={() => jumpTo(channel.id)}
        actions={
          <>
            <CountBadge count={mentionCount} />
            <MarkAsReadButton
              disabled={!readState?.isUnread}
              onClick={(event) => {
                event.stopPropagation();
                void readState?.ack();
              }}
            />
          </>
        }
      >
        <MessagePreviewBody message={channel.lastMessage} />
      </InboxCard>
    );
  }
);

export const MentionedChannelItem = observer(
  ({ channel }: { channel: Channel }) => {
    const app = useAppStore();
    const jumpTo = useJumpToMessage();
    const space = channel.space;
    const readState = app.readStates.get(channel.id);
    const mentionCount = readState?.mentionCount ?? 0;
    const message = channel.lastMentionMessage;

    if (!space) return null;

    return (
      <InboxCard
        icon={<SpaceIcon space={space} size={32} />}
        title={`#${channel.name}`}
        subtitle={space.name}
        onOpen={() => jumpTo(channel.id, message?.id)}
        actions={
          <>
            <CountBadge count={mentionCount} />
            <MarkAsReadButton
              disabled={mentionCount <= 0}
              onClick={(event) => {
                event.stopPropagation();
                void readState?.ack();
              }}
            />
          </>
        }
      >
        <MessagePreviewBody message={message} />
      </InboxCard>
    );
  }
);
