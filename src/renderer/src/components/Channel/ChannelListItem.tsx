import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useDroppable } from "@dnd-kit/core";
import { useAppStore } from "@hooks/useStores";
import {
  Avatar,
  type PaperProps,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import type { Space } from "@stores/objects/Space";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ChannelCreateModal } from "./ChannelCreateModal";
import { ChannelIcon } from "./ChannelIcon";
import { ChannelType } from "@mutualzz/types";
import { useMenu } from "@contexts/ContextMenu.context";
import { ChannelMemberItem } from "@components/Channel/ChannelMemberItem";
import { IconButton } from "@components/IconButton";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import {
  CaretRightIcon,
  GearIcon,
  LockIcon,
  PlusIcon,
  UserPlusIcon
} from "@phosphor-icons/react";

interface Props extends PaperProps {
  space: Space;
  channel: Channel;
  active: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (channelId: string) => void;
}

export const ChannelListItem = observer(
  ({
    channel,
    active,
    isCollapsed,
    space,
    onToggleCollapse,
    ...props
  }: Props) => {
    const { openContextMenu } = useMenu();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const app = useAppStore();
    const navigate = useNavigate();
    const [wrapperHovered, setWrapperHovered] = useState(false);

    const isCategory = channel.type === ChannelType.Category;
    const isVoice = channel.type === ChannelType.Voice;

    const readState = app.readStates.get(channel.id);
    const isUnread = readState?.isUnread ?? false;
    const mentionCount = readState?.mentionCount ?? 0;

    const { setNodeRef, isOver } = useDroppable({
      id: `channel-drop:${channel.id}`,
      disabled: !isVoice,
      data: {
        type: "voice-channel",
        channelId: channel.id,
        spaceId: space.id
      }
    });

    const isActiveVoiceChannel =
      channel.isVoiceChannel && app.voice.currentChannelId === channel.id;

    const canManageChannel = space.members.me?.canManageChannel(channel);
    const canInvite = space.members.me?.canInviteToChannel(channel);

    const canConnect =
      channel.isVoiceChannel && space.members.me?.canConnectToVoice(channel);

    const isDisabled = isVoice && !canConnect;

    const handleChannel = () => {
      if (isDisabled) return;

      if (isCategory) {
        if (!onToggleCollapse) return;
        onToggleCollapse(channel.id);
        return;
      }

      if (isVoice) {
        if (isActiveVoiceChannel) {
          void navigate({
            to: "/spaces/$spaceId/$channelId",
            params: {
              spaceId: space.id,
              channelId: channel.id
            }
          });
          return;
        }

        app.voice.join({
          spaceId: space.id,
          channelId: channel.id
        });
        return;
      }

      if (active) return;

      navigate({
        to: "/spaces/$spaceId/$channelId",
        params: { spaceId: space.id, channelId: channel.id }
      });
    };

    const voiceStates = Array.from(channel.voiceStates.values());

    return (
      <Stack
        ref={setNodeRef}
        ml={isCategory ? 1 : 1.5}
        mr={isCategory ? 1 : 2.5}
        px={isCategory ? 1 : 1.5}
        key={channel.id}
        onContextMenu={(e) =>
          openContextMenu(e, { type: "channel", space, channel })
        }
        borderLeft={
          isActiveVoiceChannel && voiceStates.length > 0
            ? `2px solid ${theme.colors.success}`
            : 0
        }
        borderTopLeftRadius={6}
        borderBottomLeftRadius={6}
        direction="column"
        onClick={handleChannel}
        css={{
          cursor: isDisabled ? "not-allowed" : "pointer",
          ...(isDisabled && { opacity: 0.5 }),
          ...(isOver &&
            isVoice && {
              outline: `2px solid ${theme.colors.primary}`,
              outlineOffset: 2,
              borderRadius: 6
            })
        }}
      >
        <Paper
          width="100%"
          direction="row"
          height="100%"
          alignItems="center"
          borderRadius={6}
          px={isCategory ? 1 : 1.5}
          py={isCategory ? 0 : 1}
          justifyContent="space-between"
          onMouseEnter={() => setWrapperHovered(true)}
          onMouseLeave={() => setWrapperHovered(false)}
          variant={active ? "soft" : "plain"}
          color={
            active ? theme.typography.colors.primary : (props.color as any)
          }
          {...props}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={isCategory ? 1 : 1.5}
          >
            {!isCategory && (
              <>
                {isDisabled ? (
                  <LockIcon weight="fill" size={16} />
                ) : (
                  <>
                    {channel.icon && channel.iconUrl ? (
                      <Avatar
                        src={channel.iconUrl}
                        size={16}
                        shape={
                          channel.flags.has("RoundedIcon") ? "circle" : "square"
                        }
                      />
                    ) : (
                      <ChannelIcon
                        voiceActive={isActiveVoiceChannel}
                        type={channel.type}
                      />
                    )}
                  </>
                )}
              </>
            )}

            <Typography
              textColor={isCategory && wrapperHovered ? "primary" : "secondary"}
              fontSize={isCategory ? 12 : 14}
              fontWeight={isCategory ? 400 : isUnread || active ? 700 : 600}
              letterSpacing={isCategory ? 0.5 : 0}
            >
              {channel.name}
            </Typography>
            {isCategory && (
              <CaretRightIcon
                size={12}
                color={theme.typography.colors.secondary}
                css={{
                  ...(isCollapsed && { transform: "rotate(90deg)" })
                }}
              />
            )}
          </Stack>

          <Stack alignItems="center">
            {isCategory && canManageChannel && (
              <IconButton
                size={12}
                variant="plain"
                color="neutral"
                css={{
                  borderRadius: 9999
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(
                    "create-channel",
                    <ChannelCreateModal space={space} parent={channel} />
                  );
                }}
              >
                <PlusIcon weight="bold" />
              </IconButton>
            )}

            {!isCategory && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                minWidth="2.5rem"
                justifyContent="flex-end"
              >
                {mentionCount > 0 && (
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
                )}
                {isUnread && mentionCount === 0 && !active && (
                  <Stack
                    css={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.typography.colors.primary
                    }}
                  />
                )}
                {canInvite && (wrapperHovered || active) && (
                  <IconButton
                    css={{
                      borderRadius: 9999,
                      opacity: wrapperHovered || active ? 1 : 0,
                      pointerEvents: wrapperHovered || active ? "auto" : "none",
                      transition: "opacity 0.15s ease"
                    }}
                    size={12}
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(
                        "invite-to-space",
                        <SpaceInviteToSpaceModal channel={channel} />
                      );
                    }}
                  >
                    <UserPlusIcon />
                  </IconButton>
                )}

                {canManageChannel && (wrapperHovered || active) && (
                  <IconButton
                    css={{
                      opacity: wrapperHovered || active ? 1 : 0,
                      pointerEvents: wrapperHovered || active ? "auto" : "none",
                      transition: "opacity 0.15s ease"
                    }}
                    size={12}
                    variant="plain"
                  >
                    <GearIcon />
                  </IconButton>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
        {channel.isVoiceChannel && voiceStates.length > 0 && (
          <Stack
            mt={1.25}
            spacing={0.125}
            pl={2}
            direction="column"
            css={{
              maxHeight: 100,
              overflowY: "auto"
            }}
          >
            {voiceStates.map((state) => (
              <ChannelMemberItem
                key={state.userId}
                space={space}
                state={state}
              />
            ))}
          </Stack>
        )}
      </Stack>
    );
  }
);
