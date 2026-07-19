import { observer } from "mobx-react-lite";
import { useNavigate } from "@tanstack/react-router";
import { Channel } from "@stores/objects/Channel";
import { useAppStore } from "@hooks/useStores";
import { ChannelType, PresencePayload } from "@mutualzz/types";
import { Paper } from "@components/Paper";
import {
  Avatar,
  IconSlot,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { useMenu } from "@contexts/ContextMenu.context";
import { Tooltip } from "@components/Tooltip";
import { ChatCircleSlashIcon } from "@phosphor-icons/react";
import { SmallActivityStatus } from "../SmallActivityStatus";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

const AVATAR_SIZE = 40;

export const DMChannelItem = observer(({ channel }: Props) => {
  const { t } = useTranslation("chat");
  const { t: tCommon } = useTranslation("common");
  const app = useAppStore();
  const { theme } = useTheme();

  const active = app.channels.activeId === channel.id;
  const navigate = useNavigate();
  const { openContextMenu } = useMenu();

  const meId = app.account?.id;
  const recipient = channel.dmRecipient;
  const recipients = channel.dmRecipientsList;

  const readState = app.readStates.get(channel.id);
  const isUnread = readState?.isUnread ?? false;
  const mentionCount = readState?.mentionCount ?? 0;

  const relationship =
    channel.type === ChannelType.DM && recipient
      ? app.relationships.getForMe(recipient.id)
      : null;
  const iBlockedThem =
    !!relationship?.isBlocked && relationship.userId === meId;

  const title = (() => {
    if (channel.type === ChannelType.DM)
      return recipient?.displayName ?? t("deletedUser");

    if (channel.name) return channel.name;

    const names = recipients.map((u) => u.displayName).filter(Boolean);

    if (!names.length) return tCommon("notifications.groupDmChannel");
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")},  +${names.length - 2}`;
  })();

  let preview: PresencePayload | string | null = null;
  try {
    if (app.calls.isRingingForMe(channel.id)) preview = t("call.incoming");
    else if (app.calls.isOutgoing(channel.id)) preview = t("call.calling");
    else if (app.calls.isActive(channel.id)) {
      const inThisCall =
        app.voice.currentChannelId === channel.id &&
        app.voice.connectionStatus !== "idle";
      preview = inThisCall ? t("call.inCall") : t("call.active");
    } else if (channel.isGroupDM)
      preview = `${recipients.length} ${t("groupDm.manage.members")}`;
    else if (recipient) preview = app.presence.get(recipient.id);
  } catch {
    if (recipient) preview = app.presence.get(recipient.id);
  }

  return (
    <Paper
      variant={active ? "soft" : "plain"}
      width="100%"
      direction="row"
      borderRadius={10}
      px={1}
      py={0.75}
      alignItems="center"
      spacing={1.25}
      css={{
        cursor: "pointer",
        opacity: iBlockedThem ? 0.6 : active ? 1 : 0.94,
        transition: "background-color 120ms ease, opacity 120ms ease",
        "&:hover": active ? {} : { opacity: 1 }
      }}
      onContextMenu={(e) => {
        if (recipient && channel.type === ChannelType.DM) {
          openContextMenu(e, {
            type: "user",
            user: recipient,
            insideDMs: true
          });
        }

        if (channel.type === ChannelType.GroupDM) {
          openContextMenu(e, {
            type: "group-dm",
            channel
          });
        }
      }}
      onClick={() => {
        if (!active) {
          navigate({
            to: "/@me/$channelId",
            params: {
              channelId: channel.id
            }
          });
        }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        flex={1}
        minWidth={0}
      >
        {channel.type === ChannelType.DM ? (
          <UserAvatar
            user={recipient}
            size={AVATAR_SIZE}
            badge
            showOffline
            typing={
              recipient
                ? app.typing.isUserTyping(channel.id, recipient.id)
                : false
            }
          />
        ) : channel.iconUrl ? (
          <Avatar
            src={channel.iconUrl}
            size={AVATAR_SIZE}
            shape={channel.flags.has("RoundedIcon") ? "circle" : "square"}
          />
        ) : (
          <DMGroupAvatar users={recipients} />
        )}

        <Stack direction="column" minWidth={0} flex={1}>
          <Typography
            level="label-sm"
            weight={active ? "bold" : "medium"}
            textColor={active ? "primary" : "inherit"}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {title}
          </Typography>

          {preview &&
            (typeof preview === "string" ? (
              <Typography
                level="body-xs"
                textColor="muted"
                css={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {preview}
              </Typography>
            ) : (
              <SmallActivityStatus presence={preview} showStatus />
            ))}
        </Stack>
      </Stack>
      {!active && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          minWidth={16}
        >
          {mentionCount > 0 ? (
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
              <Typography
                level="label-xs"
                css={{
                  color: "#fff",
                  fontSize: 10
                }}
              >
                {mentionCount > 99 ? "99+" : mentionCount}
              </Typography>
            </Stack>
          ) : (
            isUnread && (
              <Stack
                css={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: theme.typography.colors.primary
                }}
              />
            )
          )}
        </Stack>
      )}
      {iBlockedThem && (
        <Tooltip content={t("blocked")}>
          <IconSlot size={16}>
            <ChatCircleSlashIcon />
          </IconSlot>
        </Tooltip>
      )}
    </Paper>
  );
});
