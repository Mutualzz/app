import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { IconButton } from "@components/IconButton";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { Color, formatColor } from "@mutualzz/ui-core";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { SpaceModerated } from "@components/Modals/SpaceModerated";
import {
  GearIcon,
  HeadphonesIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  MonitorArrowUpIcon,
  PhoneIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon
} from "@phosphor-icons/react";
import { HeadphonesOffIcon } from "@components/icons/HeadphonesOffIcon";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip } from "@components/Tooltip";

// NOTE: Instead of using hovered, you should use the Animated motion stuff, fix it. (Azrael)
export const UserBar = observer(() => {
  const app = useAppStore();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { openModal } = useModal();
  const { openContextMenu } = useMenu();
  const [hovered, setHovered] = useState(false);

  const voiceChannel = app.voice.channel;

  const voiceStatus = app.voice.connectionStatus;
  const voiceError = app.voice.connectionError;

  const showVoicePill =
    Boolean(voiceChannel) ||
    voiceStatus === "connecting" ||
    voiceStatus === "failed";

  const account = app.account;

  let voiceTitle: string;
  let voiceTitleColor: Color;
  switch (voiceStatus) {
    case "connecting":
      voiceTitle = "RTC Connecting";
      voiceTitleColor = "warning";
      break;
    case "connected":
      voiceTitle = "Voice Connected";
      voiceTitleColor = "success";
      break;
    case "failed":
      voiceTitle = "Connection Failed";
      voiceTitleColor = "danger";
      break;
    case "idle":
    default:
      voiceTitle = "Voice";
      voiceTitleColor = "neutral";
  }

  let voiceSubtitle: string | undefined;
  if (voiceChannel) {
    voiceSubtitle =
      `${voiceChannel.name} / ${voiceChannel.space?.name ?? ""}`.trim();
  } else if (voiceStatus === "failed") {
    voiceSubtitle = voiceError ?? "Unable to connect";
  }

  const canHangup =
    Boolean(app.voice.currentSpaceId) && Boolean(app.voice.currentChannelId);

  const cameraEnabled = app.voice.cameraEnabled;
  const screenShareEnabled = app.voice.screenShareEnabled;

  if (!account) return null;

  return (
    <Stack
      mb={2}
      ml={1}
      position="absolute"
      bottom={0}
      width="97.5%"
      direction="column"
    >
      {showVoicePill && (
        <Paper
          borderTopRightRadius={15}
          borderTopLeftRadius={15}
          elevation={app.settings?.preferEmbossed ? 5 : 1}
          color="neutral"
          p={2.5}
          zIndex={theme.zIndex.appBar + 1}
          direction="column"
          spacing={2.5}
        >
          <Stack
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack spacing={1.25} direction="column">
              <Typography
                variant="plain"
                color={voiceTitleColor}
                level="body-sm"
              >
                {voiceTitle}
              </Typography>

              {voiceSubtitle && (
                <Typography
                  level="body-xs"
                  textColor="secondary"
                  fontFamily="monospace"
                  css={{
                    maxWidth: "17rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  title={voiceSubtitle}
                >
                  {voiceSubtitle}
                </Typography>
              )}
            </Stack>

            <Tooltip content="Disconnect" placement="top">
              <IconButton
                disabled={!canHangup}
                onClick={() => app.voice.leave()}
              >
                <PhoneIcon
                  weight="fill"
                  css={{
                    transform: "rotate(135deg)"
                  }}
                />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1.25} width="100%">
            <Tooltip
              placement="top"
              content={cameraEnabled ? "Disable camera" : "Enable camera"}
            >
              <IconButton
                variant="soft"
                onClick={() => {
                  app.voice.toggleCamera();
                  if (
                    voiceChannel &&
                    app.channels.activeId != voiceChannel?.id &&
                    !cameraEnabled
                  ) {
                    if (voiceChannel.spaceId) {
                      navigate({
                        to: "/spaces/$spaceId/$channelId",
                        params: {
                          spaceId: voiceChannel.spaceId,
                          channelId: voiceChannel.id
                        }
                      });
                    } else {
                      navigate({
                        to: "/@me/$channelId",
                        params: {
                          channelId: voiceChannel.id
                        }
                      });
                    }
                  }
                }}
                css={{
                  flex: 1
                }}
              >
                {cameraEnabled ? (
                  <VideoCameraIcon weight="fill" color={theme.colors.success} />
                ) : (
                  <VideoCameraSlashIcon weight="fill" />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip
              placement="top"
              content={
                screenShareEnabled ? "Stop sharing" : "Share your screen"
              }
            >
              <IconButton
                variant="soft"
                onClick={() => app.voice.toggleScreenShare()}
                css={{
                  flex: 1
                }}
                color={screenShareEnabled ? theme.colors.success : undefined}
              >
                <MonitorArrowUpIcon weight="fill" />
              </IconButton>
            </Tooltip>

            {screenShareEnabled && app.voice.screenShareSupportsAudio && (
              <Tooltip
                placement="top"
                content={
                  app.voice.screenShareAudioEnabled
                    ? "Mute stream audio"
                    : "Unmute stream audio"
                }
              >
                <IconButton
                  variant="soft"
                  onClick={() => app.voice.toggleScreenShareAudio()}
                >
                  {app.voice.screenShareAudioEnabled ? (
                    <SpeakerHighIcon
                      weight="fill"
                      color={theme.colors.success}
                    />
                  ) : (
                    <SpeakerSlashIcon weight="fill" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Paper>
      )}

      <Paper
        justifyContent="space-between"
        alignItems="center"
        px={2.5}
        py={1.25}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        color="neutral"
        borderTop={showVoicePill ? "0 !important" : undefined}
        width="100%"
        zIndex={theme.zIndex.appBar + 1}
        spacing={1.25}
        {...(showVoicePill
          ? {
              borderBottomRightRadius: 15,
              borderBottomLeftRadius: 15
            }
          : { borderRadius: 15 })}
        minWidth="10rem"
        direction="row"
      >
        <Paper
          direction="row"
          alignItems="center"
          spacing={2.5}
          width={showVoicePill ? "75%" : "100%"}
          px={1}
          py={0.25}
          minWidth={0}
          borderRadius={6}
          variant={hovered ? "soft" : "plain"}
          color={formatColor(theme.colors.neutral, { alpha: 90 })}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();

            openContextMenu(
              event,
              {
                id: generateMenuIDs.user(account.id),
                type: "account",
                account
              },
              null,
              {
                x: Math.round(rect.left),
                y: Math.round(rect.top - 8)
              }
            );
          }}
          css={{
            cursor: "pointer",
            userSelect: "none",
            transition: "background-color 0.2s"
          }}
        >
          <UserAvatar user={account} size={48} badge />
          <Stack direction="column" minWidth={0}>
            <Typography
              level="body-sm"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {account.displayName}
            </Typography>
            {hovered &&
              account.presence?.activities.length === 0 &&
              account.globalName && (
                <Typography
                  level="body-xs"
                  textColor="muted"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {account.username}
                </Typography>
              )}

            {!hovered && account.presence && (
              <SmallActivityStatus
                vertical={false}
                presence={account.presence}
                showStatus
              />
            )}
          </Stack>
        </Paper>

        <Stack alignItems="center" direction="row" spacing={0.25} mr={1.25} flexShrink={0}>
          <Tooltip
            placement="top"
            content={
              app.voice.spaceMute
                ? "Space Muted"
                : app.voice.effectiveSelfMute
                  ? "Muted"
                  : "Mute"
            }
          >
            <IconButton
              variant="plain"
              onClick={() => {
                if (app.voice.spaceMute) {
                  openModal("space-muted", <SpaceModerated type="muted" />);
                  return;
                }

                app.voice.setMute(!app.voice.selfMute);
              }}
            >
              {app.voice.effectiveSelfMute ? (
                <MicrophoneSlashIcon
                  weight="fill"
                  color={app.voice.spaceMute ? theme.colors.danger : undefined}
                />
              ) : (
                <MicrophoneIcon weight="fill" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip
            placement="top"
            content={
              app.voice.spaceDeaf
                ? "Space Deafened"
                : app.voice.effectiveSelfDeaf
                  ? "Deafened"
                  : "Deafen"
            }
          >
            <IconButton
              variant="plain"
              onClick={() => {
                if (app.voice.spaceDeaf) {
                  openModal(
                    "space-deafened",
                    <SpaceModerated type="deafened" />
                  );
                  return;
                }
                app.voice.setDeaf(!app.voice.selfDeaf);
              }}
            >
              {app.voice.effectiveSelfDeaf ? (
                <HeadphonesOffIcon
                  weight="fill"
                  color={app.voice.spaceDeaf ? theme.colors.danger : undefined}
                />
              ) : (
                <HeadphonesIcon weight="fill" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip placement="top" content="Settings">
            <IconButton
              onClick={() => openModal("user-settings", <UserSettingsModal />)}
              variant="plain"
            >
              <GearIcon weight="fill" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Stack>
  );
});
