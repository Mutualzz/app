import type { Channel } from "@stores/objects/Channel.ts";
import { Paper, Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList.tsx";
import { MessageInput } from "@components/Message/MessageInput.tsx";
import { VoiceChannelHeader } from "@components/Channel/VoiceChannelHeader.tsx";
import { useAppStore } from "@hooks/useStores.ts";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { clamp, dynamicElevation } from "@mutualzz/ui-core";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar.tsx";
import { Button } from "@components/Button.tsx";
import { IconButton } from "@components/IconButton.tsx";
import { MdChatBubble } from "react-icons/md";
import { useNavigate } from "@tanstack/react-router";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";
import { ChannelIcon } from "@components/Channel/ChannelIcon.tsx";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { FaUserPlus } from "react-icons/fa";
import { useModal } from "@contexts/Modal.context.tsx";

interface Props {
    channel: Channel;
    showChat?: boolean;
}

const ResizeBar = motion.create("div");

// TODO: Add a little show members at the bottom so user can switch to other users (simialr to discord)
// TODO: Fix that users are not being populated within VoiceState.ts when refreshed
export const VoiceChannelView = observer(
    ({ channel, showChat = false }: Props) => {
        const app = useAppStore();
        const navigate = useNavigate();
        const { theme } = useTheme();
        const hostRef = useRef<HTMLDivElement>(null);
        const [hovered, setHovered] = useState(false);
        const { openModal } = useModal();

        const [selectedUserId, setSelectedUserId] = useState<string | null>(
            null,
        );

        useEffect(() => {
            app.setVoiceChatVisible(showChat);
        }, [showChat]);

        useEffect(() => {
            if (hovered) app.setHideSwitcher(true);
            else app.setHideSwitcher(false);
        }, [hovered]);

        const voiceStates = Array.from(channel.voiceStates.values());

        const tileCount = voiceStates.length;

        const shrinkFactor = clamp(1 - (tileCount - 1) * 0.09, 0.35, 1);

        const tileSize = {
            width: Math.round(640 * shrinkFactor),
            height: Math.round(480 * shrinkFactor),
            avatar: Math.round(128 * shrinkFactor),
        };

        const selectedState = voiceStates.find(
            (state) => state.user?.id === selectedUserId,
        );

        if (!channel.spaceId) return null;

        return (
            <Stack flex={1}>
                <Stack
                    flex={1}
                    direction="row"
                    overflow="hidden"
                    justifyContent="center"
                    height="100%"
                    width="100%"
                    minHeight={0}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                    position="relative"
                >
                    {selectedState ? (
                        <Paper
                            width="100%"
                            height="90%"
                            justifyContent="center"
                            alignItems="center"
                            my="auto"
                            onClick={() => setSelectedUserId(null)}
                            css={{
                                cursor: "pointer",
                            }}
                            variant="solid"
                            color={selectedState.user?.accentColor}
                        >
                            <UserAvatar user={selectedState.user} size={256} />
                        </Paper>
                    ) : voiceStates.length === 0 ? (
                        <Stack
                            flex={1}
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            spacing={2.5}
                        >
                            <Typography fontWeight="bold" level="h2">
                                {channel.name}
                            </Typography>
                            <Typography level="h6">
                                No one is currently in voice
                            </Typography>
                            <Button
                                padding={12}
                                onClick={() => {
                                    app.voice.join({
                                        spaceId: channel.spaceId,
                                        channelId: channel.id,
                                    });
                                }}
                            >
                                Join Voice
                            </Button>
                        </Stack>
                    ) : (
                        <Stack
                            flex={1}
                            minWidth={0}
                            minHeight={0}
                            height="100%"
                            overflow="hidden"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Stack
                                width="100%"
                                height="100%"
                                minHeight={0}
                                overflowY="auto"
                                overflowX="hidden"
                                wrap="wrap"
                                justifyContent="center"
                                alignContent="start"
                                spacing={2.5}
                                p={12.5}
                                display="grid"
                                margin="0 auto"
                                css={{
                                    gridAutoFlow: "column",
                                    gridAutoColumns: "max-content",
                                    gridTemplateRows:
                                        "repeat(auto-fill, minmax(0, max-content))",
                                    justifyItems: "center",
                                }}
                            >
                                {voiceStates.map((state) => (
                                    <Paper
                                        key={state.user?.id}
                                        width={tileSize.width}
                                        height={tileSize.height}
                                        borderRadius={16}
                                        flex={`0 0 ${tileSize.width}px`}
                                        justifyContent="center"
                                        alignItems="center"
                                        css={{
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            setSelectedUserId(
                                                state.user?.id ?? null,
                                            )
                                        }
                                        variant="solid"
                                        color={state.user?.accentColor}
                                    >
                                        <UserAvatar
                                            user={state.user}
                                            size={tileSize.avatar}
                                        />
                                    </Paper>
                                ))}
                            </Stack>
                        </Stack>
                    )}
                    {hovered && (
                        <>
                            {/** Top Stack **/}
                            <Stack
                                position="absolute"
                                top={2}
                                width="100%"
                                px={4}
                                justifyContent="space-between"
                                zIndex={1}
                            >
                                <Typography
                                    display="flex"
                                    alignItems="center"
                                    spacing={1.25}
                                >
                                    <ChannelIcon type={channel.type} />{" "}
                                    {channel.name}
                                </Typography>
                                {!showChat && (
                                    <Tooltip
                                        placement="left"
                                        content={
                                            <TooltipWrapper>
                                                Open Chat
                                            </TooltipWrapper>
                                        }
                                    >
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate({
                                                    to: "/spaces/$spaceId/$channelId",
                                                    search: {
                                                        chat: true,
                                                    },
                                                    params: {
                                                        spaceId:
                                                            channel.spaceId!,
                                                        channelId: channel.id,
                                                    },
                                                });
                                            }}
                                        >
                                            <MdChatBubble />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                            {/** Bottom Stack */}
                            <Stack
                                position="absolute"
                                bottom={2}
                                width="100%"
                                px={4}
                                justifyContent="space-between"
                                zIndex={1}
                            >
                                <Tooltip
                                    content={
                                        <TooltipWrapper>Invite</TooltipWrapper>
                                    }
                                >
                                    <IconButton
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
                                </Tooltip>
                            </Stack>
                        </>
                    )}
                </Stack>

                {showChat && (
                    <>
                        <ResizeBar
                            onPointerDown={(e) => {
                                const startX = e.clientX;
                                const startWidth = app.voiceChatWidth;

                                (
                                    e.currentTarget as HTMLDivElement
                                ).setPointerCapture(e.pointerId);

                                const onMove = (moveEvent: PointerEvent) => {
                                    const deltaX = moveEvent.clientX - startX;
                                    const rawWidth = startWidth - deltaX;

                                    app.setVoiceChatWidth(rawWidth);
                                };

                                const onUp = () => {
                                    window.removeEventListener(
                                        "pointermove",
                                        onMove,
                                    );
                                    window.removeEventListener(
                                        "pointerup",
                                        onUp,
                                    );
                                };

                                window.addEventListener("pointermove", onMove);
                                window.addEventListener("pointerup", onUp);
                            }}
                            style={{
                                width: 2,
                                cursor: "col-resize",
                                flexShrink: 0,
                                touchAction: "none",
                                userSelect: "none",
                                backgroundColor: app.settings?.preferEmbossed
                                    ? dynamicElevation(theme.colors.surface, 3)
                                    : "transparent",
                            }}
                            whileHover={{
                                backgroundColor: app.settings?.preferEmbossed
                                    ? dynamicElevation(theme.colors.surface, 6)
                                    : dynamicElevation(theme.colors.surface, 2),
                            }}
                        />
                        <Paper
                            ref={hostRef}
                            elevation={app.settings?.preferEmbossed ? 3 : 0}
                            direction="column"
                            borderTop="0 !important"
                            borderRight="0 !important"
                            borderBottom="0 !important"
                            width={app.voiceChatWidth}
                            css={{
                                flexShrink: 0,
                                minWidth: 0,
                            }}
                        >
                            <VoiceChannelHeader channel={channel} />
                            <Stack
                                direction="column"
                                position="relative"
                                overflow="hidden"
                                minWidth={0}
                                flex={1}
                            >
                                <MessageList channel={channel} />
                                <MessageInput channel={channel} />
                            </Stack>
                        </Paper>
                    </>
                )}
            </Stack>
        );
    },
);
