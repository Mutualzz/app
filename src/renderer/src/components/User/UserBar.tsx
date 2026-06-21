import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { type PaperProps, Stack, Typography, useTheme } from "@mutualzz/ui-web";
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

  const inFeed = app.mode === "feed";

  const conditionalProps: Omit<PaperProps, "color"> = inFeed
    ? {
        width: "4.25rem",
        height: showVoicePill ? "25rem" : "17.5rem",
        direction: "column"
      }
    : {
        minWidth: "10rem",
        direction: "row"
      };

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
      {showVoicePill && !inFeed && (
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
              placement={inFeed ? "right" : "top"}
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
              placement={inFeed ? "right" : "top"}
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
                placement={inFeed ? "right" : "top"}
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
        {...(showVoicePill && !inFeed
          ? {
              borderBottomRightRadius: 15,
              borderBottomLeftRadius: 15
            }
          : { borderRadius: 15 })}
        {...conditionalProps}
      >
        <Paper
          direction={inFeed ? "column" : "row"}
          alignItems="center"
          spacing={2.5}
          width={!inFeed && showVoicePill ? "75%" : "100%"}
          px={1}
          py={0.25}
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
              {
                x: inFeed ? Math.round(rect.left + 55) : Math.round(rect.left),
                y: inFeed
                  ? Math.round(rect.top + 10)
                  : Math.round(Math.max(8, rect.top - 415))
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
          <Stack direction="column">
            <Typography
              textAlign={inFeed ? "center" : undefined}
              level="body-sm"
            >
              {account.displayName}
            </Typography>
            {account.presence?.activities.length === 0 &&
              account.globalName && (
                <Typography level="body-xs" textColor="muted">
                  {account.username}
                </Typography>
              )}
            {account.presence && (
              <SmallActivityStatus
                vertical={inFeed}
                presence={account.presence}
              />
            )}
          </Stack>
        </Paper>

        {inFeed && showVoicePill && (
          <Stack direction="column" spacing={1.25} alignItems="center">
            <Tooltip
              content={
                <Stack direction="column" spacing={0.5}>
                  <Typography level="body-sm" color={voiceTitleColor}>
                    {voiceTitle}
                  </Typography>
                  {voiceSubtitle && (
                    <Typography level="body-xs" textColor="muted">
                      {voiceSubtitle}
                    </Typography>
                  )}
                </Stack>
              }
              placement="right"
            >
              <IconButton variant="plain" color={voiceTitleColor}>
                <HeadphonesIcon weight="fill" />
              </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={1.25} alignItems="center">
              <Tooltip
                placement="right"
                content={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                <IconButton
                  variant="plain"
                  onClick={() => app.voice.toggleCamera()}
                >
                  {cameraEnabled ? (
                    <VideoCameraIcon
                      weight="fill"
                      color={theme.colors.success}
                    />
                  ) : (
                    <VideoCameraSlashIcon
                      weight="fill"
                      color={theme.colors.neutral}
                    />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip
                placement="right"
                content={
                  screenShareEnabled ? "Stop sharing" : "Share your screen"
                }
              >
                <IconButton
                  variant="plain"
                  onClick={() => app.voice.toggleScreenShare()}
                >
                  <MonitorArrowUpIcon
                    weight="fill"
                    color={
                      screenShareEnabled
                        ? theme.colors.success
                        : theme.colors.neutral
                    }
                  />
                </IconButton>
              </Tooltip>
            </Stack>

            {screenShareEnabled && app.voice.screenShareSupportsAudio && (
              <Tooltip
                placement="right"
                content={
                  app.voice.screenShareAudioEnabled
                    ? "Mute stream audio"
                    : "Unmute stream audio"
                }
              >
                <IconButton
                  variant="plain"
                  onClick={() => app.voice.toggleScreenShareAudio()}
                >
                  {app.voice.screenShareAudioEnabled ? (
                    <SpeakerHighIcon
                      weight="fill"
                      color={theme.colors.success}
                    />
                  ) : (
                    <SpeakerSlashIcon
                      weight="fill"
                      color={theme.colors.neutral}
                    />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {canHangup && (
              <Tooltip content="Disconnect" placement="right">
                <IconButton onClick={() => app.voice.leave()}>
                  <PhoneIcon
                    css={{
                      transform: "rotate(135deg)"
                    }}
                    weight="fill"
                  />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        <Stack
          alignItems="center"
          direction={inFeed ? "column" : "row"}
          spacing={inFeed ? undefined : 0.25}
          mr={inFeed ? undefined : 1.25}
          flexShrink={0}
        >
          <Tooltip
            placement={inFeed ? "right" : "top"}
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

                app.voice.setMute(!app.settings?.preferredSelfMute);
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
            placement={inFeed ? "right" : "top"}
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
                app.voice.setDeaf(!app.settings?.preferredSelfDeaf);
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

          <Tooltip placement={inFeed ? "right" : "top"} content="Settings">
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
