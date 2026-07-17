import { Paper } from "@components/Paper";
import { useModal } from "@contexts/Modal.context";
import { useDroppable, type DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useAppStore } from "@hooks/useStores";
import {
  Avatar,
  type PaperProps,
  IconSlot,
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
import { useElapsedClock } from "@hooks/useElapsedClock";
import { getChannelOccupiedAt } from "@utils/voiceElapsed";
import {
  CaretRightIcon,
  ChatCircleIcon,
  GearIcon,
  LockIcon,
  PlusIcon,
  UserPlusIcon
} from "@phosphor-icons/react";
import { ChannelSettingsModal } from "@components/ChannelSettings/ChannelSettingsModal";
import { HoverRevealActions } from "../HoverRevealActions";
import { useTranslation } from "react-i18next";

interface Props extends PaperProps {
  space: Space;
  channel: Channel;
  active: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (channelId: string) => void;
  channelDragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}

export const ChannelListItem = observer(
  ({
    channel,
    active,
    isCollapsed,
    space,
    onToggleCollapse,
    channelDragHandle,
    ...props
  }: Props) => {
    const { openContextMenu } = useMenu();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const app = useAppStore();
    const navigate = useNavigate();
    const { t } = useTranslation("chat");
    const [wrapperHovered, setWrapperHovered] = useState(false);

    const isCategory = channel.type === ChannelType.Category;
    const isVoice = channel.type === ChannelType.Voice;

    const readState = app.readStates.get(channel.id);
    const isUnread = readState?.isUnread ?? false;
    const mentionCount = readState?.mentionCount ?? 0;

    const canMoveMembers = space.members.me?.hasPermission("MoveMembers");

    const { setNodeRef, isOver } = useDroppable({
      id: `channel-drop:${channel.id}`,
      disabled: !isVoice || !canMoveMembers,
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
          navigate({
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
    const channelOccupiedAt = getChannelOccupiedAt(voiceStates);
    const channelElapsed = useElapsedClock(channelOccupiedAt);

    return (
      <Stack
        ref={setNodeRef}
        ml={isCategory ? 1 : channel.hasParent ? 2 : 1.5}
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
          minHeight={isCategory ? undefined : 28}
          justifyContent="space-between"
          onMouseEnter={() => setWrapperHovered(true)}
          onMouseLeave={() => setWrapperHovered(false)}
          variant={active ? "soft" : "plain"}
          surfaceRole={
            active && theme.backgroundImageUrl ? "card" : undefined
          }
          color={
            active ? theme.typography.colors.primary : (props.color as any)
          }
          css={{
            ...(channelDragHandle && { cursor: "grab" })
          }}
          {...channelDragHandle?.attributes}
          {...channelDragHandle?.listeners}
          {...props}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={isCategory ? 1 : 1.5}
            flex={1}
            onClick={handleChannel}
            minWidth={0}
          >
            {!isCategory && (
              <>
                {isDisabled ? (
                  <IconSlot size={16}>
                    <LockIcon weight="fill" />
                  </IconSlot>
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
                      <IconSlot size={16}>
                        <ChannelIcon
                          voiceActive={isActiveVoiceChannel}
                          type={channel.type}
                        />
                      </IconSlot>
                    )}
                  </>
                )}
              </>
            )}

            <Typography
              level={isCategory ? "label-xs" : "label-sm"}
              textColor={isCategory && wrapperHovered ? "primary" : "secondary"}
              weight={isCategory ? 400 : isUnread || active ? 700 : 600}
              letterSpacing={isCategory ? 0.5 : 0}
              css={{ minWidth: 0 }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {channel.name}
            </Typography>
            {isCategory && (
              <IconSlot size={12}>
                <CaretRightIcon
                  color={theme.typography.colors.secondary}
                  css={{
                    ...(isCollapsed && { transform: "rotate(90deg)" })
                  }}
                />
              </IconSlot>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {isCategory && canManageChannel && (
              <IconButton
                size={12}
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
                justifyContent="flex-end"
                css={{
                  minWidth:
                    (!wrapperHovered &&
                      (channelElapsed ||
                        mentionCount > 0 ||
                        (isUnread && !active))) ||
                    wrapperHovered
                      ? undefined
                      : "2.5rem"
                }}
              >
                {!wrapperHovered && channelElapsed && (
                  <Typography
                    level="label-xs"
                    textColor="muted"
                    css={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                    aria-label={t("voice.channelOccupied", {
                      time: channelElapsed
                    })}
                  >
                    {channelElapsed}
                  </Typography>
                )}
                {!wrapperHovered && mentionCount > 0 && (
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
                )}
                {!wrapperHovered && isUnread && mentionCount === 0 && !active && (
                  <Stack
                    css={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.typography.colors.primary
                    }}
                  />
                )}
                {wrapperHovered && (
                  <HoverRevealActions visible={wrapperHovered}>
                    {channel.type === ChannelType.Voice && (
                      <IconButton
                        css={{ borderRadius: 9999 }}
                        size={12}
                        variant="plain"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate({
                            to: "/spaces/$spaceId/$channelId",
                            params: {
                              spaceId: space.id,
                              channelId: channel.id
                            },
                            search: {
                              chat: true
                            }
                          });
                        }}
                      >
                        <ChatCircleIcon weight="fill" />
                      </IconButton>
                    )}
                    {canInvite && (
                      <IconButton
                        css={{ borderRadius: 9999 }}
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
                        <UserPlusIcon weight="fill" />
                      </IconButton>
                    )}
                    {canManageChannel && (
                      <IconButton
                        size={12}
                        variant="plain"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(
                            `channel-settings-${channel.id}`,
                            <ChannelSettingsModal
                              space={space}
                              channel={channel}
                            />
                          );
                        }}
                      >
                        <GearIcon weight="fill" />
                      </IconButton>
                    )}
                  </HoverRevealActions>
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
            onPointerDown={(e) => e.stopPropagation()}
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
