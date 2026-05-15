import type { Channel } from "@stores/objects/Channel";
import { Paper, Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList";
import { MessageInput } from "@components/Message/MessageInput";
import { VoiceChannelHeader } from "@components/Channel/VoiceChannelHeader";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { clamp, dynamicElevation } from "@mutualzz/ui-core";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { MdChatBubble } from "react-icons/md";
import { useNavigate } from "@tanstack/react-router";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { ChannelIcon } from "@components/Channel/ChannelIcon";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { FaUserPlus } from "react-icons/fa";
import { useModal } from "@contexts/Modal.context";
import type { User } from "@stores/objects/User";

interface Props {
    channel: Channel;
    showChat?: boolean;
}

const ResizeBar = motion.create("div");

interface TileProps {
    userId: string;
    user?: User;
    size: number;
    selected?: boolean;
}

const Tile = observer(({ userId, user, size, selected }: TileProps) => {
    const app = useAppStore();
    const videoRef = useRef<HTMLVideoElement>(null);

    const isSelf = app.account?.id === userId;
    const videoStream = isSelf
        ? app.voice.getLocalCameraStream()
        : app.voice.getVideoStreamForUser(userId);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        el.srcObject = videoStream;
        return () => {
            el.srcObject = null;
        };
    }, [videoStream]);

    if (!videoStream) return <UserAvatar user={user} size={size} />;

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            // muted={isSelf}
            muted
            css={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: selected ? 0 : 16,
                display: "block",
                boxSizing: "border-box",
                objectFit: "cover",
            }}
        />
    );
});

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

        const voiceStates = Array.from(channel.voiceStates.values());

        const tileAspect = 16 / 9;
        const tileCount = voiceStates.length;

        const shrinkFactor = clamp(1 - (tileCount - 1) * 0.12, 0.35, 1);

        const baseWidth = 640;
        const tileWidth = Math.round(baseWidth * shrinkFactor);
        const tileHeight = Math.round(tileWidth / tileAspect);

        const tileSize = {
            width: tileWidth,
            height: tileHeight,
            avatar: Math.round(96 * shrinkFactor),
        };

        const selectedState = voiceStates.find(
            (state) => state.userId === selectedUserId,
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
                            overflow="hidden"
                            variant="solid"
                            color={selectedState.member?.user?.accentColor}
                        >
                            <Tile
                                userId={selectedState.userId}
                                user={selectedState.user}
                                size={256}
                                selected
                            />
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
                                        position="relative"
                                        css={{
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            voiceStates.find(
                                                (vs) =>
                                                    vs.userId ===
                                                    app.account?.id,
                                            ) &&
                                            setSelectedUserId(
                                                state.member?.user?.id ?? null,
                                            )
                                        }
                                        variant="solid"
                                        color={state.member?.user?.accentColor}
                                    >
                                        <Tile
                                            userId={state.userId}
                                            user={state.user}
                                            size={tileSize.avatar}
                                        />
                                        {hovered && (
                                            <Paper
                                                p={2}
                                                position="absolute"
                                                bottom={5}
                                                left={5}
                                                fontWeight="bold"
                                                elevation={
                                                    app.settings?.preferEmbossed
                                                        ? 2
                                                        : -2
                                                }
                                                borderRadius={8}
                                            >
                                                <Typography>
                                                    {state.member
                                                        ? state.member
                                                              .displayName
                                                        : state.user
                                                              ?.displayName ||
                                                          "Unknown User"}
                                                </Typography>
                                            </Paper>
                                        )}
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
                                <MessageInput />
                            </Stack>
                        </Paper>
                    </>
                )}
            </Stack>
        );
    },
);
