import { CallRingingAvatar } from "@components/Call/CallRingingAvatar";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip } from "@components/Tooltip";
import { CallCameraVideo } from "@components/Voice/CallCameraVideo";
import { useAppStore } from "@hooks/useStores";
import { useElapsedClock } from "@hooks/useElapsedClock";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import {
  Button,
  Stack,
  Typography,
  useTheme
} from "@mutualzz/ui-web";
import { IconButton } from "@components/IconButton";
import type { Channel } from "@stores/objects/Channel";
import {
  DesktopIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  MonitorArrowUpIcon,
  PhoneIcon,
  PhoneSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  channel: Channel;
}

const ResizeBar = motion.create("div");
const TILE_RADIUS = 8;

const NameBadge = ({ children }: { children: string }) => {
  const { theme } = useTheme();
  return (
    <Typography
      level="label-xs"
      textColor="primary"
      position="absolute"
      left={10}
      bottom={10}
      css={{
        maxWidth: "calc(100% - 20px)",
        padding: "3px 8px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        borderRadius: 4,
        zIndex: 2,
        fontWeight: 600,
        background: formatColor(theme.colors.background, {
          alpha: 0.65,
          format: "hexa"
        })
      }}
    >
      {children}
    </Typography>
  );
};

const MuteBadge = () => {
  const { theme } = useTheme();
  return (
    <Stack
      position="absolute"
      right={10}
      top={10}
      alignItems="center"
      justifyContent="center"
      css={{
        width: 26,
        height: 26,
        borderRadius: 999,
        zIndex: 2,
        background: formatColor(theme.colors.danger, {
          alpha: 0.92,
          format: "hexa"
        }),
        boxShadow: `0 1px 4px ${formatColor(theme.colors.background, {
          alpha: 0.45,
          format: "hexa"
        })}`
      }}
    >
      <MicrophoneSlashIcon size={14} weight="fill" color="#fff" />
    </Stack>
  );
};

const CallParticipantTile = observer(
  ({
    userId,
    displayName,
    fill
  }: {
    userId: string;
    displayName: string;
    fill?: boolean;
  }) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const isSelf = app.account?.id === userId;
    const cameraStream = isSelf
      ? app.voice.getLocalCameraStream()
      : app.voice.getCameraStreamForUser(userId);
    const speaking =
      app.voice.isUserSpeaking(userId) &&
      !(isSelf && app.voice.effectiveSelfMute);
    const muted = isSelf
      ? app.voice.effectiveSelfMute
      : !!app.voiceStates.get(userId)?.selfMute;
    const tileBg = dynamicElevation(
      theme.colors.surface,
      app.settings?.preferEmbossed ? 3 : 2
    );

    return (
      <Paper
        position="relative"
        minWidth={0}
        minHeight={0}
        borderRadius={TILE_RADIUS}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        elevation={0}
        variant="soft"
        css={{
          flex: fill ? "1 1 0" : "0 1 calc(50% - 4px)",
          width: fill ? undefined : "calc(50% - 4px)",
          maxWidth: fill ? undefined : 260,
          height: fill ? "100%" : undefined,
          maxHeight: fill ? undefined : "100%",
          aspectRatio: fill ? undefined : "1 / 1",
          alignSelf: fill ? "stretch" : "center",
          background: tileBg,
          outline: speaking
            ? `3px solid ${theme.colors.success}`
            : "none",
          outlineOffset: -3,
          transition: "outline-color 120ms ease"
        }}
      >
        {cameraStream ? (
          <CallCameraVideo
            userId={userId}
            stream={cameraStream}
            isSelf={isSelf}
            objectFit="cover"
          />
        ) : (
          <UserAvatar
            user={app.users.get(userId) ?? null}
            size={fill ? 96 : 80}
          />
        )}
        {muted && <MuteBadge />}
        <NameBadge>{displayName}</NameBadge>
      </Paper>
    );
  }
);

const CallRingingParticipantTile = observer(
  ({
    userId,
    displayName,
    fill
  }: {
    userId: string;
    displayName: string;
    fill?: boolean;
  }) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const user = app.users.get(userId) ?? null;
    const tileBg = dynamicElevation(
      theme.colors.surface,
      app.settings?.preferEmbossed ? 3 : 2
    );

    return (
      <Paper
        position="relative"
        minWidth={0}
        minHeight={0}
        borderRadius={TILE_RADIUS}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        elevation={0}
        variant="soft"
        css={{
          flex: fill ? "1 1 0" : "0 1 calc(50% - 4px)",
          width: fill ? undefined : "calc(50% - 4px)",
          maxWidth: fill ? undefined : 260,
          height: fill ? "100%" : undefined,
          maxHeight: fill ? undefined : "100%",
          aspectRatio: fill ? undefined : "1 / 1",
          alignSelf: fill ? "stretch" : "center",
          background: tileBg
        }}
      >
        <Stack
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          minHeight={0}
          css={{ paddingBottom: 36 }}
        >
          <CallRingingAvatar
            user={user}
            size={fill ? 96 : 80}
            pulsing
            dimmed
          />
        </Stack>
        <Stack
          position="absolute"
          left={10}
          bottom={10}
          direction="column"
          spacing={0.15}
          css={{
            maxWidth: "calc(100% - 20px)",
            padding: "3px 8px",
            borderRadius: 4,
            zIndex: 2,
            background: formatColor(theme.colors.background, {
              alpha: 0.65,
              format: "hexa"
            })
          }}
        >
          <Typography
            level="label-xs"
            textColor="primary"
            fontWeight={600}
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {displayName}
          </Typography>
          <Typography level="label-xs" textColor="secondary">
            {t("call.calling")}
          </Typography>
        </Stack>
      </Paper>
    );
  }
);

const CallScreenShareTile = observer(
  ({ userId, displayName }: { userId: string; displayName: string }) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { t } = useTranslation("chat");
    const videoRef = useRef<HTMLVideoElement>(null);
    const isSelf = app.account?.id === userId;
    const watching = app.voice.isWatchingScreenShare(userId);
    const screenStream = isSelf
      ? app.voice.getLocalScreenStream()
      : watching
        ? app.voice.getScreenStreamForUser(userId)
        : null;

    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;
      if (el.srcObject !== screenStream) el.srcObject = screenStream ?? null;
      return () => {
        if (videoRef.current?.srcObject === screenStream) {
          videoRef.current.srcObject = null;
        }
      };
    }, [screenStream]);

    return (
      <Paper
        position="relative"
        minWidth={0}
        width="100%"
        borderRadius={TILE_RADIUS}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        elevation={0}
        variant="soft"
        css={{
          aspectRatio: "16 / 10",
          background: dynamicElevation(theme.colors.surface, 2)
        }}
      >
        {screenStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            css={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "contain",
              background: theme.colors.background
            }}
          />
        ) : (
          <Stack direction="column" alignItems="center" spacing={1.25} p={2}>
            <DesktopIcon size={30} weight="fill" color={theme.colors.success} />
            <Typography level="label-sm" textColor="primary">
              {t("voice.sharingScreen", { name: displayName })}
            </Typography>
            {!isSelf && (
              <Button
                size="sm"
                color="success"
                onClick={() =>
                  void app.voice.watchScreenShare(userId).catch(() => {})
                }
              >
                {t("voice.watchStream")}
              </Button>
            )}
          </Stack>
        )}
        <NameBadge>{displayName}</NameBadge>
      </Paper>
    );
  }
);

export const DMCallView = observer(({ channel }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { t } = useTranslation("chat");

  const call = app.calls.getCall(channel.id);
  const ringingForMe = app.calls.isRingingForMe(channel.id);
  const outgoing = app.calls.isOutgoing(channel.id);
  const inThisCall =
    app.voice.currentChannelId === channel.id &&
    app.voice.connectionStatus !== "idle";

  const selfId = app.account?.id ? String(app.account.id) : null;
  const selfVoiceState = selfId ? app.voiceStates.get(selfId) : undefined;
  const elapsed = useElapsedClock(
    call &&
      call.status !== "ended" &&
      inThisCall &&
      selfVoiceState?.channelId &&
      String(selfVoiceState.channelId) === String(channel.id) &&
      !selfVoiceState.disconnectedAt
      ? selfVoiceState.joinedAt
      : null
  );

  useEffect(() => {
    if (app.dmCallViewHeight < 240) app.setDmCallViewHeight(240);
  }, [app]);

  if (!call || call.status === "ended") return null;

  const initiator = app.users.get(String(call.initiatorId));
  const ringingPeerId = call.ringing.find((id) => String(id) !== selfId);
  const stageUser = ringingForMe
    ? (initiator ??
      channel.dmRecipient ??
      (ringingPeerId ? app.users.get(String(ringingPeerId)) : null) ??
      null)
    : outgoing
      ? (channel.isDM
          ? (channel.dmRecipient ??
            (ringingPeerId ? app.users.get(String(ringingPeerId)) : null) ??
            null)
          : (channel.dmRecipients[0] ??
            (ringingPeerId ? app.users.get(String(ringingPeerId)) : null) ??
            null))
      : (initiator ?? null);
  const stageName =
    stageUser?.displayName ??
    (channel.isGroupDM ? (channel.name ?? t("deletedUser")) : t("deletedUser"));

  const voiceStates = Array.from(channel.voiceStates.values());
  const voiceUserIds = new Set(voiceStates.map((state) => String(state.userId)));
  const ringingTargets = call.ringing
    .map(String)
    .filter((id) => id !== selfId && !voiceUserIds.has(id));
  const pendingSelf =
    outgoing && !!selfId && !voiceUserIds.has(selfId) ? selfId : null;
  const screenSharers = voiceStates.filter((state) =>
    app.voice.isUserScreenSharing(state.userId)
  );
  const connecting =
    inThisCall && app.voice.connectionStatus === "connecting";
  const participantCount =
    (pendingSelf ? 1 : 0) + voiceStates.length + ringingTargets.length;
  const fillPair =
    participantCount === 2 &&
    screenSharers.length === 0 &&
    !ringingForMe &&
    !connecting;
  const showIncomingStage = ringingForMe;
  const showCallerGrid =
    !showIncomingStage &&
    (outgoing ||
      voiceStates.length > 0 ||
      screenSharers.length > 0 ||
      ringingTargets.length > 0);

  const cameraEnabled = app.voice.cameraEnabled;
  const screenShareEnabled = app.voice.screenShareEnabled;
  const selfMute = app.voice.selfMute;

  const isParticipant =
    !!selfId &&
    (String(call.initiatorId) === selfId ||
      call.accepted.includes(selfId) ||
      call.ringing.includes(selfId));
  const showHangup = inThisCall || outgoing;

  const stageBackground = dynamicElevation(
    theme.colors.surface,
    app.settings?.preferEmbossed ? 1 : 0
  );
  const controlsBackground = dynamicElevation(
    theme.colors.surface,
    app.settings?.preferEmbossed ? 3 : 2
  );
  const controlSoft = dynamicElevation(
    theme.colors.surface,
    app.settings?.preferEmbossed ? 5 : 4
  );

  const callHeight = Math.max(240, app.dmCallViewHeight);
  const compactStage = ringingForMe ? callHeight < 300 : callHeight < 260;
  const controlsReserve = ringingForMe
    ? compactStage
      ? 68
      : 100
    : elapsed
      ? 84
      : 64;
  const stageAvail = Math.max(0, callHeight - controlsReserve);
  const ringingAvatarSize = compactStage
    ? Math.min(72, Math.max(48, stageAvail - 36))
    : 112;

  const circleBtn = {
    width: 40,
    height: 40,
    borderRadius: 999,
    background: controlSoft
  } as const;

  const hangup = () => {
    void (async () => {
      const isInitiator = !!selfId && String(call.initiatorId) === selfId;
      if (isInitiator && (call.status === "ringing" || outgoing)) {
        await app.calls.cancel(channel.id);
      } else if (!isInitiator && isParticipant) {
        await app.calls.abandon(channel.id);
      } else if (!inThisCall && isParticipant) {
        await app.calls.abandon(channel.id);
      }
      await app.voice.leave();
    })();
  };

  return (
    <Stack
      direction="column"
      width="100%"
      height={callHeight}
      css={{
        flexShrink: 0,
        background: stageBackground,
        overflow: "hidden"
      }}
    >
      <Stack
        px={compactStage ? 1 : 1.5}
        pt={compactStage ? 0.75 : 1.5}
        pb={compactStage ? 0.5 : 1}
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        flex={1}
        minHeight={0}
        width="100%"
      >
        {showIncomingStage ? (
          <Stack
            width="100%"
            height="100%"
            minHeight={0}
            alignItems="center"
            justifyContent="center"
            px={0.5}
          >
            <Paper
              position="relative"
              width="100%"
              height="100%"
              minHeight={0}
              borderRadius={TILE_RADIUS}
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              elevation={0}
              variant="soft"
              css={{
                background: dynamicElevation(
                  theme.colors.surface,
                  app.settings?.preferEmbossed ? 3 : 2
                )
              }}
            >
              <Stack
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
                minHeight={0}
                css={{
                  paddingBottom: compactStage ? 28 : 48
                }}
              >
                <CallRingingAvatar
                  user={stageUser}
                  size={ringingAvatarSize}
                  pulsing
                  dimmed
                />
              </Stack>
              <Stack
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                px={1}
                py={compactStage ? 0.5 : 1}
                direction="column"
                spacing={0.15}
                css={{
                  pointerEvents: "none",
                  background: `linear-gradient(transparent, ${formatColor(
                    theme.colors.background,
                    { alpha: 0.72, format: "hexa" }
                  )})`
                }}
              >
                <Typography
                  level={compactStage ? "label-sm" : "title-md"}
                  textColor="primary"
                  fontWeight={700}
                  css={{
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2
                  }}
                >
                  {stageName}
                </Typography>
                {!compactStage && (
                  <Typography
                    level="body-sm"
                    textColor="secondary"
                    css={{ textAlign: "center" }}
                  >
                    {t("call.incoming")}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        ) : showCallerGrid ? (
          <Stack
            direction="column"
            width="100%"
            height={fillPair ? "100%" : undefined}
            minHeight={0}
            spacing={1}
            alignItems="center"
            justifyContent="center"
            css={{ flex: fillPair ? 1 : undefined }}
          >
            <Stack
              direction="row"
              flexWrap={fillPair ? "nowrap" : "wrap"}
              width="100%"
              height={fillPair ? "100%" : undefined}
              minHeight={0}
              gap={1}
              alignItems={fillPair ? "stretch" : "center"}
              justifyContent="center"
              css={{
                display: "flex"
              }}
            >
              {pendingSelf && (
                <CallParticipantTile
                  key={`self:${pendingSelf}`}
                  userId={pendingSelf}
                  displayName={
                    app.account?.displayName ??
                    app.users.get(pendingSelf)?.displayName ??
                    t("deletedUser")
                  }
                  fill={fillPair}
                />
              )}
              {voiceStates.map((state) => (
                <CallParticipantTile
                  key={state.userId}
                  userId={state.userId}
                  displayName={state.user?.displayName ?? t("deletedUser")}
                  fill={fillPair}
                />
              ))}
              {ringingTargets.map((userId) => (
                <CallRingingParticipantTile
                  key={`ringing:${userId}`}
                  userId={userId}
                  displayName={
                    app.users.get(userId)?.displayName ?? t("deletedUser")
                  }
                  fill={fillPair}
                />
              ))}
              {screenSharers.map((state) => (
                <CallScreenShareTile
                  key={`${state.userId}:screen`}
                  userId={state.userId}
                  displayName={state.user?.displayName ?? t("deletedUser")}
                />
              ))}
            </Stack>
          </Stack>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            height="100%"
          >
            <CallRingingAvatar
              user={stageUser}
              size={112}
              pulsing={false}
              dimmed={false}
            />
            <Typography
              level="title-md"
              textColor="primary"
              fontWeight={700}
              css={{ textAlign: "center" }}
            >
              {stageName}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack
        direction="column"
        alignItems="center"
        spacing={0.75}
        px={2.5}
        py={compactStage && ringingForMe ? 1.25 : 1.5}
        css={{
          flexShrink: 0,
          background: controlsBackground
        }}
      >
        {elapsed && !ringingForMe && (
          <Typography
            level="label-sm"
            textColor="secondary"
            css={{ fontVariantNumeric: "tabular-nums" }}
          >
            {elapsed}
          </Typography>
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1.25}
          width="100%"
        >
        {ringingForMe ? (
          <>
            <Stack direction="column" alignItems="center" spacing={compactStage ? 0 : 0.75}>
              <Tooltip content={t("call.decline")}>
                <IconButton
                  color="danger"
                  variant="solid"
                  onClick={() => void app.calls.decline(channel.id)}
                  css={{
                    width: compactStage ? 44 : 56,
                    height: compactStage ? 44 : 56,
                    borderRadius: 999
                  }}
                >
                  <PhoneSlashIcon size={compactStage ? 20 : 24} weight="fill" />
                </IconButton>
              </Tooltip>
              {!compactStage && (
                <Typography level="label-xs" textColor="secondary">
                  {t("call.decline")}
                </Typography>
              )}
            </Stack>
            <Stack
              direction="column"
              alignItems="center"
              spacing={compactStage ? 0 : 0.75}
              css={{ marginLeft: compactStage ? 20 : 32 }}
            >
              <Tooltip content={t("call.accept")}>
                <IconButton
                  color="success"
                  variant="solid"
                  onClick={() => void app.calls.accept(channel.id)}
                  css={{
                    width: compactStage ? 44 : 56,
                    height: compactStage ? 44 : 56,
                    borderRadius: 999
                  }}
                >
                  <PhoneIcon size={compactStage ? 20 : 24} weight="fill" />
                </IconButton>
              </Tooltip>
              {!compactStage && (
                <Typography level="label-xs" textColor="secondary">
                  {t("call.accept")}
                </Typography>
              )}
            </Stack>
          </>
        ) : (
          <>
            {(inThisCall || outgoing) && (
              <>
                <Tooltip content={t("voice.controls.mute")}>
                  <IconButton
                    variant="soft"
                    color={selfMute ? "danger" : undefined}
                    onClick={() => app.voice.setMute(!app.voice.selfMute)}
                    css={circleBtn}
                  >
                    {selfMute ? (
                      <MicrophoneSlashIcon weight="fill" size={20} />
                    ) : (
                      <MicrophoneIcon weight="fill" size={20} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip
                  content={
                    cameraEnabled
                      ? t("voice.controls.disableCamera")
                      : t("voice.controls.enableCamera")
                  }
                >
                  <IconButton
                    variant="soft"
                    color={cameraEnabled ? undefined : "danger"}
                    onClick={() => app.voice.toggleCamera()}
                    css={circleBtn}
                  >
                    {cameraEnabled ? (
                      <VideoCameraIcon weight="fill" size={20} />
                    ) : (
                      <VideoCameraSlashIcon weight="fill" size={20} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip
                  content={
                    screenShareEnabled
                      ? t("voice.controls.stopSharing")
                      : t("voice.controls.shareScreen")
                  }
                >
                  <IconButton
                    variant="soft"
                    onClick={() => app.voice.toggleScreenShare()}
                    color={screenShareEnabled ? "success" : undefined}
                    css={circleBtn}
                  >
                    <MonitorArrowUpIcon weight="fill" size={20} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {!inThisCall && !outgoing && !ringingForMe && (
              <Button
                color="success"
                css={{ borderRadius: 999, paddingInline: 20 }}
                onClick={() =>
                  void app.voice.join({
                    spaceId: null,
                    channelId: channel.id
                  })
                }
              >
                <PhoneIcon weight="fill" />
                {t("call.join")}
              </Button>
            )}

            {showHangup && (
              <Tooltip content={t("voice.connection.disconnect")}>
                <IconButton
                  color="danger"
                  variant="solid"
                  onClick={hangup}
                  css={{
                    width: 56,
                    height: 40,
                    borderRadius: 999,
                    marginLeft: 4
                  }}
                >
                  <PhoneIcon
                    weight="fill"
                    size={20}
                    css={{
                      transform: "rotate(135deg)"
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
        </Stack>
      </Stack>
      <ResizeBar
        onPointerDown={(e) => {
          const startY = e.clientY;
          const startHeight = app.dmCallViewHeight;

          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

          const onMove = (moveEvent: PointerEvent) => {
            app.setDmCallViewHeight(startHeight + (moveEvent.clientY - startY));
          };

          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
        style={{
          height: 2,
          marginTop: -1,
          marginBottom: -1,
          cursor: "row-resize",
          flexShrink: 0,
          touchAction: "none",
          userSelect: "none",
          backgroundColor: app.settings?.preferEmbossed
            ? dynamicElevation(theme.colors.surface, 4)
            : "transparent"
        }}
        whileHover={{
          backgroundColor: app.settings?.preferEmbossed
            ? dynamicElevation(theme.colors.surface, 6)
            : dynamicElevation(theme.colors.surface, 2)
        }}
      />
    </Stack>
  );
});
