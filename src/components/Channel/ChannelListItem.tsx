import { Paper } from "@components/Paper.tsx";
import { useModal } from "@contexts/Modal.context.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import {
    Avatar,
    type PaperProps,
    Stack,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel.ts";
import type { Space } from "@stores/objects/Space.ts";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
    FaChevronDown,
    FaChevronRight,
    FaCog,
    FaPlus,
    FaUserPlus,
} from "react-icons/fa";
import { ChannelCreateModal } from "./ChannelCreateModal.tsx";
import { ChannelIcon } from "./ChannelIcon.tsx";
import { ChannelType } from "@mutualzz/types";
import { useMenu } from "@contexts/ContextMenu.context.tsx";
import { ChannelMemberItem } from "@components/Channel/ChannelMemberItem.tsx";
import { IconButton } from "@components/IconButton.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { MdChatBubble } from "react-icons/md";

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

        const isActiveVoiceChannel =
            channel.isVoiceChannel && app.voice.currentChannelId === channel.id;

        const canManageChannel = space.members.me?.canManageChannel(channel);
        const canInvite = space.members.me?.canInviteToChannel(channel);

        const canConnect =
            channel.isVoiceChannel &&
            space.members.me?.canConnectToVoice(channel);

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
                            channelId: channel.id,
                        },
                    });
                    return;
                }
                app.voice.join({ spaceId: space.id, channelId: channel.id });
                return;
            }

            if (active) return;

            navigate({
                to: "/spaces/$spaceId/$channelId",
                params: { spaceId: space.id, channelId: channel.id },
            });
        };

        const voiceStates = Array.from(channel.voiceStates.values());

        return (
            <>
                <Stack
                    ml={isCategory ? 1 : 1.5}
                    mr={isCategory ? 1 : 2.5}
                    px={isCategory ? 1 : 1.5}
                    key={channel.id}
                    onContextMenu={(e) =>
                        openContextMenu(e, { type: "channel", space, channel })
                    }
                    borderLeft={
                        isActiveVoiceChannel || voiceStates.length > 0
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
                            active
                                ? theme.typography.colors.primary
                                : (props.color as any)
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
                                    {channel.icon && channel.iconUrl ? (
                                        <Avatar
                                            src={channel.iconUrl}
                                            size={16}
                                        />
                                    ) : (
                                        <ChannelIcon
                                            voiceActive={isActiveVoiceChannel}
                                            type={channel.type}
                                        />
                                    )}
                                </>
                            )}

                            <Typography
                                textColor={
                                    isCategory && wrapperHovered
                                        ? "primary"
                                        : "secondary"
                                }
                                fontSize={isCategory ? 12 : 14}
                                fontWeight={isCategory ? 400 : 600}
                                letterSpacing={isCategory ? 0.5 : 0}
                            >
                                {channel.name}
                            </Typography>
                            {isCategory && (
                                <>
                                    {isCollapsed ? (
                                        <FaChevronRight
                                            size={8}
                                            color={
                                                theme.typography.colors
                                                    .secondary
                                            }
                                        />
                                    ) : (
                                        <FaChevronDown
                                            size={8}
                                            color={
                                                theme.typography.colors
                                                    .secondary
                                            }
                                        />
                                    )}
                                </>
                            )}
                        </Stack>

                        <Stack alignItems="center">
                            {isCategory && canManageChannel && (
                                <IconButton
                                    size={12}
                                    variant="plain"
                                    color="neutral"
                                    css={{
                                        borderRadius: 9999,
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(
                                            "create-channel",
                                            <ChannelCreateModal
                                                space={space}
                                                parent={channel}
                                            />,
                                        );
                                    }}
                                >
                                    <FaPlus />
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
                                    {isVoice && (
                                        <IconButton
                                            css={{
                                                borderRadius: 9999,
                                                opacity:
                                                    wrapperHovered || active
                                                        ? 1
                                                        : 0,
                                                pointerEvents:
                                                    wrapperHovered || active
                                                        ? "auto"
                                                        : "none",
                                                transition:
                                                    "opacity 0.15s ease",
                                            }}
                                            size={12}
                                            variant="plain"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate({
                                                    to: "/spaces/$spaceId/$channelId",
                                                    search: {
                                                        chat: true,
                                                    },
                                                    params: {
                                                        spaceId: space.id,
                                                        channelId: channel.id,
                                                    },
                                                });
                                            }}
                                        >
                                            <MdChatBubble />
                                        </IconButton>
                                    )}
                                    {canInvite && (
                                        <IconButton
                                            css={{
                                                borderRadius: 9999,
                                                opacity:
                                                    wrapperHovered || active
                                                        ? 1
                                                        : 0,
                                                pointerEvents:
                                                    wrapperHovered || active
                                                        ? "auto"
                                                        : "none",
                                                transition:
                                                    "opacity 0.15s ease",
                                            }}
                                            size={12}
                                            variant="plain"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal(
                                                    "invite-to-space",
                                                    <SpaceInviteToSpaceModal
                                                        channel={channel}
                                                    />,
                                                );
                                            }}
                                        >
                                            <FaUserPlus />
                                        </IconButton>
                                    )}

                                    {canManageChannel && (
                                        <IconButton
                                            css={{
                                                borderRadius: 9999,
                                                opacity:
                                                    wrapperHovered || active
                                                        ? 1
                                                        : 0,
                                                pointerEvents:
                                                    wrapperHovered || active
                                                        ? "auto"
                                                        : "none",
                                                transition:
                                                    "opacity 0.15s ease",
                                            }}
                                            size={12}
                                            variant="plain"
                                        >
                                            <FaCog />
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
                                overflowY: "auto",
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
            </>
        );
    },
);
