import { observer } from "mobx-react-lite";
import { useNavigate } from "@tanstack/react-router";
import { Channel } from "@stores/objects/Channel";
import { useAppStore } from "@hooks/useStores";
import { ChannelType } from "@mutualzz/types";
import { Paper } from "@components/Paper";
import { Avatar, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { DMGroupAvatar } from "@components/DMChannel/DMGroupAvatar";
import { useMenu } from "@contexts/ContextMenu.context";
import { Tooltip } from "@components/Tooltip";
import { ChatCircleSlashIcon } from "@phosphor-icons/react";

interface Props {
  channel: Channel;
}

const AVATAR_SIZE = 40;

export const DMChannelItem = observer(({ channel }: Props) => {
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
      return recipient?.displayName ?? "Deleted User";

    if (channel.name) return channel.name;

    const names = recipients.map((u) => u.displayName).filter(Boolean);

    if (!names.length) return "Group DM Channel";
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")},  +${names.length - 2}`;
  })();

  let preview: string | null = null;
  const lastMessage = channel.lastMessage;
  if (channel.isGroupDM) preview = `${recipients.length} Members`;
  else if (lastMessage)
    preview = `${lastMessage.author?.displayName}: ${lastMessage.content}`;

  return (
    <Paper
      variant={active ? "soft" : "plain"}
      width="100%"
      borderRadius={10}
      px={1}
      py={0.75}
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
      <Stack direction="row" alignItems="center" spacing={1.25} width="100%">
        {channel.type === ChannelType.DM ? (
          <UserAvatar
            user={recipient}
            size={AVATAR_SIZE}
            badge
            showInvisible
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
            level="body-sm"
            weight={active ? "bold" : "medium"}
            textColor={active ? "primary" : "inherit"}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {title}
          </Typography>

          {preview && (
            <Typography
              level="body-xs"
              variant="plain"
              color="neutral"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {preview}
            </Typography>
          )}
        </Stack>
      </Stack>
      {!active && (
        <Stack alignItems="center" justifyContent="center" minWidth={16}>
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
                level="body-xs"
                fontWeight="bold"
                css={{
                  color: "#fff",
                  fontSize: 10,
                  lineHeight: 1
                }}
              >
                {mentionCount > 99 ? "99+" : mentionCount}
              </Typography>
            </Stack>
          ) : isUnread ? (
            <Stack
              css={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: theme.typography.colors.primary
              }}
            />
          ) : null}
        </Stack>
      )}
      {iBlockedThem && (
        <Tooltip content="Blocked">
          <ChatCircleSlashIcon />
        </Tooltip>
      )}
    </Paper>
  );
});
