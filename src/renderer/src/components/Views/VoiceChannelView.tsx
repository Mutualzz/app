import { CallCameraVideo } from "@components/Voice/CallCameraVideo";
import type { Channel } from "@stores/objects/Channel";
import { Paper, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { MessageList } from "@components/Message/MessageList";
import { MessageInput } from "@components/Message/MessageInput";
import { VoiceChannelHeader } from "@components/Channel/VoiceChannelHeader";
import { VoiceMinecraftBadge } from "@components/Channel/VoiceChannelMemberRow";
import { useAppStore } from "@hooks/useStores";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { clamp, ColorLike, dynamicElevation } from "@mutualzz/ui-core";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@components/User/UserAvatar";
import { Button } from "@components/Button";
import { IconButton } from "@components/IconButton";
import { useNavigate } from "@tanstack/react-router";
import { ChannelIcon } from "@components/Channel/ChannelIcon";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal";
import { useModal } from "@contexts/Modal.context";
import type { User } from "@stores/objects/User";
import { useMenu } from "@contexts/ContextMenu.context";
import {
  ChatCircleIcon,
  DesktopIcon,
  UserPlusIcon
} from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface Props {
  channel: Channel;
  showChat?: boolean;
}

const ResizeBar = motion.create("div");

type VoiceTileKind = "participant" | "screen";

interface VoiceTileRef {
  userId: string;
  kind: VoiceTileKind;
}

interface ParticipantTileProps {
  userId: string;
  user?: User;
  size: number;
  selected?: boolean;
}

const ParticipantTile = observer(
  ({ userId, user, size, selected }: ParticipantTileProps) => {
    const app = useAppStore();

    const isSelf = app.account?.id === userId;
    const cameraStream = isSelf
      ? app.voice.getLocalCameraStream()
      : app.voice.getCameraStreamForUser(userId);

    const member = app.spaces.active?.members.get(userId);
    const speaking =
      app.voice.isUserSpeaking(userId) &&
      !(isSelf && app.voice.effectiveSelfMute);

    if (!cameraStream)
      return (
        <UserAvatar
          member={member}
          user={user}
          size={size}
          speaking={speaking}
        />
      );

    return (
      <Stack
        width="100%"
        height="100%"
        position="relative"
        alignItems="center"
        justifyContent="center"
        css={selected ? { backgroundColor: "#000" } : undefined}
      >
        <CallCameraVideo
          userId={userId}
          stream={cameraStream}
          isSelf={isSelf}
          objectFit={selected ? "contain" : "cover"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: selected ? 0 : 16,
            boxSizing: "border-box"
          }}
        />
      </Stack>
    );
  }
);

interface ScreenShareTileProps {
  userId: string;
  user?: User;
  size: number;
  selected?: boolean;
  onWatch?: () => void;
}

const ScreenShareTile = observer(
  ({ userId, user, size, selected, onWatch }: ScreenShareTileProps) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const videoRef = useRef<HTMLVideoElement>(null);

    const isSelf = app.account?.id === userId;
    const isWatching = app.voice.isWatchingScreenShare(userId);
    const screenStream = isSelf
      ? app.voice.getLocalScreenStream()
      : isWatching
        ? app.voice.getScreenStreamForUser(userId)
        : null;

    const member = app.spaces.active?.members.get(userId);
    const displayName =
      member?.displayName ?? user?.displayName ?? t("deletedUser");

    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;
      if (el.srcObject !== screenStream) {
        el.srcObject = screenStream;
      }
      return () => {
        if (videoRef.current?.srcObject === screenStream) {
          videoRef.current.srcObject = null;
        }
      };
    }, [screenStream]);

    if (isSelf && app.voice.screenShareEnabled && !screenStream) {
      return (
        <Stack
          direction="column"
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          p={3}
          css={{ backgroundColor: "#000" }}
        >
          <DesktopIcon
            size={Math.round(size * 0.35)}
            weight="fill"
            color={theme.colors.success}
          />
          <Typography level="body-sm" textAlign="center" color="success">
            {t("voice.startingScreenShare")}
          </Typography>
        </Stack>
      );
    }

    if (!screenStream) {
      return (
        <Stack
          direction="column"
          width="100%"
          height="100%"
          alignItems="center"
          justifyContent="center"
          spacing={2.5}
          p={3}
        >
          <DesktopIcon size={Math.round(size * 0.35)} weight="fill" />
          <Typography level="body-sm" textAlign="center">
            {t("voice.sharingScreen", { name: displayName })}
          </Typography>
          <Button
            size="sm"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              void app.voice
                .watchScreenShare(userId)
                .then(() => onWatch?.())
                .catch((err) => {
                  console.error("watchScreenShare failed", err);
                  toast.error(t("voice.errors.watchStreamFailed"));
                });
            }}
          >
            {t("voice.watchStream")}
          </Button>
        </Stack>
      );
    }

    return (
      <Stack width="100%" height="100%" position="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          css={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: selected ? 0 : 16,
            display: "block",
            boxSizing: "border-box",
            objectFit: "contain",
            backgroundColor: "#000"
          }}
        />
        {!isSelf && (
          <Stack position="absolute" top={8} right={8}>
            <Button
              size="sm"
              color="neutral"
              onClick={(e) => {
                e.stopPropagation();
                app.voice.stopWatchingScreenShare(userId);
              }}
            >
              {t("voice.stopWatching")}
            </Button>
          </Stack>
        )}
      </Stack>
    );
  }
);

export const VoiceChannelView = observer(
  ({ channel, showChat = false }: Props) => {
    const app = useAppStore();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const hostRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const { openModal } = useModal();
    const { t } = useTranslation("chat");

    const { openContextMenu } = useMenu();

    const [selectedTile, setSelectedTile] = useState<VoiceTileRef | null>(null);

    useEffect(() => {
      app.setVoiceChatVisible(showChat);
    }, [showChat]);

    const voiceStates = Array.from(channel.voiceStates.values());

    const tiles: {
      key: string;
      userId: string;
      kind: VoiceTileKind;
      user?: User;
    }[] = [];

    for (const state of voiceStates) {
      tiles.push({
        key: `${state.userId}:participant`,
        userId: state.userId,
        kind: "participant",
        user: state.user
      });

      if (app.voice.isUserScreenSharing(state.userId)) {
        tiles.push({
          key: `${state.userId}:screen`,
          userId: state.userId,
          kind: "screen",
          user: state.user
        });
      }
    }

    const tileAspect = 16 / 9;
    const tileCount = tiles.length;

    const shrinkFactor = clamp(1 - (tileCount - 1) * 0.12, 0.35, 1);

    const baseWidth = 640;
    const tileWidth = Math.round(baseWidth * shrinkFactor);
    const tileHeight = Math.round(tileWidth / tileAspect);

    const tileSize = {
      width: tileWidth,
      height: tileHeight,
      avatar: Math.round(96 * shrinkFactor)
    };

    const selectedState = selectedTile
      ? voiceStates.find((state) => state.userId === selectedTile.userId)
      : undefined;

    const selfVoiceState = app.account?.id
      ? voiceStates.find((state) => state.userId === app.account?.id)
      : undefined;
    const selfOnMinecraft = selfVoiceState?.client === "minecraft";

    if (!channel.spaceId) return null;

    return (
      <Stack flex={1}>
        {selfOnMinecraft && (
          <Paper
            px={2}
            py={1}
            mx={2}
            mt={1}
            borderRadius={8}
            variant="soft"
            color="neutral"
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <VoiceMinecraftBadge />
            <Typography level="label-sm" textColor="muted">
              {t("voice.controls.audioInMinecraft")}
            </Typography>
          </Paper>
        )}
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
          {selectedTile && selectedState ? (
            <Stack
              flex={1}
              width="100%"
              height="100%"
              alignItems="center"
              justifyContent="center"
              minHeight={0}
            >
              <Paper
                width="100%"
                maxHeight="90%"
                justifyContent="center"
                alignItems="center"
                onClick={() => setSelectedTile(null)}
                css={{
                  cursor: "pointer",
                  aspectRatio: "16 / 9",
                  maxWidth: "min(100%, calc(90vh * 16 / 9))"
                }}
                overflow="hidden"
                variant="solid"
                color={selectedState.member?.user?.accentColor as ColorLike}
                onContextMenu={(e) => {
                  if (
                    !selectedState?.member ||
                    !selectedState.user ||
                    !selectedState.space
                  )
                    return;

                  openContextMenu(e, {
                    type: "user",
                    user: selectedState.user,
                    space: selectedState.space,
                    member: selectedState.member
                  });
                }}
              >
                {selectedTile.kind === "screen" ? (
                  <ScreenShareTile
                    userId={selectedTile.userId}
                    user={selectedState.user}
                    size={256}
                    selected
                  />
                ) : (
                  <ParticipantTile
                    userId={selectedTile.userId}
                    user={selectedState.user}
                    size={256}
                    selected
                  />
                )}
              </Paper>
            </Stack>
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
              <Typography level="h6">{t("voice.noOneInVoice")}</Typography>
              <Button
                padding={12}
                color="neutral"
                onClick={() => {
                  app.voice.join({
                    spaceId: channel.spaceId,
                    channelId: channel.id
                  });
                }}
              >
                {t("voice.joinVoice")}
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
                  gridAutoFlow: "row",
                  gridAutoColumns: "max-content",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(0, max-content))",
                  justifyItems: "center"
                }}
              >
                {tiles.map((tile) => {
                  const state = voiceStates.find(
                    (vs) => vs.userId === tile.userId
                  );
                  if (!state) return null;

                  const isScreen = tile.kind === "screen";

                  return (
                    <Paper
                      key={tile.key}
                      width={tileSize.width}
                      height={tileSize.height}
                      borderRadius={16}
                      flex={`0 0 ${tileSize.width}px`}
                      justifyContent="center"
                      alignItems="center"
                      position="relative"
                      css={{
                        cursor: "pointer"
                      }}
                      onClick={() =>
                        voiceStates.find(
                          (vs) => vs.userId === app.account?.id
                        ) &&
                        setSelectedTile({
                          userId: tile.userId,
                          kind: tile.kind
                        })
                      }
                      variant="solid"
                      color={state.member?.user?.accentColor as ColorLike}
                      onContextMenu={(e) => {
                        if (!state?.member || !state.user || !state.space)
                          return;

                        openContextMenu(e, {
                          type: "user",
                          user: state.user,
                          space: state.space,
                          member: state.member
                        });
                      }}
                    >
                      {isScreen ? (
                        <ScreenShareTile
                          userId={tile.userId}
                          user={tile.user}
                          size={tileSize.avatar}
                          onWatch={() =>
                            setSelectedTile({
                              userId: tile.userId,
                              kind: "screen"
                            })
                          }
                        />
                      ) : (
                        <ParticipantTile
                          userId={tile.userId}
                          user={tile.user}
                          size={tileSize.avatar}
                        />
                      )}
                      {state.client === "minecraft" && !isScreen && (
                        <Stack position="absolute" top={8} right={8} zIndex={1}>
                          <VoiceMinecraftBadge />
                        </Stack>
                      )}
                      {hovered && (
                        <Paper
                          p={2}
                          position="absolute"
                          bottom={5}
                          left={5}
                          fontWeight="bold"
                          elevation={app.settings?.preferEmbossed ? 2 : -2}
                          borderRadius={8}
                        >
                          <Typography>
                            {isScreen
                              ? t("voice.screenLabel", {
                                  name:
                                    state.member?.displayName ??
                                    state.user?.displayName ??
                                    t("deletedUser")
                                })
                              : state.member
                                ? state.member.displayName
                                : (state.user?.displayName ?? t("deletedUser"))}
                          </Typography>
                        </Paper>
                      )}
                    </Paper>
                  );
                })}
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
                <Typography display="flex" alignItems="center" spacing={1.25}>
                  <ChannelIcon type={channel.type} /> {channel.name}
                </Typography>
                {!showChat && (
                  <Tooltip placement="left" content={t("voice.openChat")}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({
                          to: "/spaces/$spaceId/$channelId",
                          search: {
                            chat: true
                          },
                          params: {
                            spaceId: channel.spaceId!,
                            channelId: channel.id
                          }
                        });
                      }}
                    >
                      <ChatCircleIcon weight="fill" />
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
                <Tooltip content={t("voice.invite")}>
                  <IconButton
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

                (e.currentTarget as HTMLDivElement).setPointerCapture(
                  e.pointerId
                );

                const onMove = (moveEvent: PointerEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const rawWidth = startWidth - deltaX;

                  app.setVoiceChatWidth(rawWidth);
                };

                const onUp = () => {
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                };

                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
              style={{
                width: 2,
                marginLeft: -1,
                marginRight: -1,
                cursor: "col-resize",
                flexShrink: 0,
                touchAction: "none",
                userSelect: "none",
                backgroundColor: app.settings?.preferEmbossed
                  ? dynamicElevation(theme.colors.surface, 3)
                  : "transparent"
              }}
              whileHover={{
                backgroundColor: app.settings?.preferEmbossed
                  ? dynamicElevation(theme.colors.surface, 6)
                  : dynamicElevation(theme.colors.surface, 2)
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
                minWidth: 0
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
  }
);
