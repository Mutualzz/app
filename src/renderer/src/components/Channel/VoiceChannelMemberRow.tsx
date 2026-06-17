import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import type { VoiceState } from "@stores/objects/VoiceState.ts";
import { MicrophoneSlashIcon, MonitorIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { HeadphonesOffIcon } from "../icons/HeadphonesOffIcon";
import { Tooltip } from "@components/Tooltip";
import { observer } from "mobx-react-lite";

interface Props {
  space: Space;
  state: VoiceState;
  hovered?: boolean;
}

export const VoiceChannelMemberRow = observer(
  ({ space, state, hovered = false }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();

    const member = space.members.get(state.userId);
    if (!member) return null;

    const videoOn =
      app.account?.id === state.userId
        ? !!app.voice.getLocalCameraStream()
        : !!app.voice.getCameraStreamForUser(member.id);

    const screenOn = app.voice.isUserScreenSharing(member.id);

    const isStale = !!state.disconnectedAt;
    const isOtherClient =
      state.sessionId !== app.voice.currentSessionId &&
      state.userId === app.account?.id;

    const isSubtle = isStale || isOtherClient;

    const nameColor: ColorLike = isSubtle
      ? "#99aab5"
      : ((member.highestRole?.color as ColorLike) ??
        (hovered ? theme.typography.colors.primary : "#99aab5"));

    const speaking =
      app.voice.isUserSpeaking(member.id) &&
      !(state.userId === app.account?.id && app.voice.effectiveSelfMute);

    return (
      <Paper
        width="100%"
        variant={hovered ? "soft" : "plain"}
        borderRadius={8}
        alignItems="center"
        height={32}
        px={1}
        justifyContent="space-between"
        css={{
          opacity: isSubtle ? 0.55 : 1
        }}
      >
        <Stack spacing={1.75} alignItems="center">
          <UserAvatar
            user={member.user}
            member={member}
            size={24}
            speaking={speaking}
          />
          <Typography
            flex={1}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            level="body-sm"
            direction="row"
            alignItems="center"
            display="flex"
            spacing={2}
            textColor={nameColor}
          >
            {member.displayName}
          </Typography>
        </Stack>
        <Stack spacing={1.75} alignItems="center">
          {screenOn && (
            <Paper
              variant="solid"
              color="success"
              px={0.75}
              py={0.25}
              borderRadius={4}
              css={{ flexShrink: 0 }}
            >
              <Typography
                level="body-xs"
                fontWeight="bold"
                css={{ lineHeight: 1, letterSpacing: "0.04em" }}
              >
                LIVE
              </Typography>
            </Paper>
          )}
          {screenOn && (
            <Tooltip content="Screen sharing">
              <MonitorIcon weight="fill" color={theme.colors.success} />
            </Tooltip>
          )}
          {videoOn && (
            <Tooltip content="Video">
              <VideoCameraIcon weight="fill" />
            </Tooltip>
          )}
          {state.selfMute && !state.spaceMute && (
            <Tooltip content="Muted">
              <MicrophoneSlashIcon weight="fill" />
            </Tooltip>
          )}
          {state.spaceMute && (
            <Tooltip content="Space Muted">
              <MicrophoneSlashIcon weight="fill" color={theme.colors.danger} />
            </Tooltip>
          )}
          {state.selfDeaf && (
            <Tooltip content="Deafened">
              <HeadphonesOffIcon weight="fill" />
            </Tooltip>
          )}
          {state.spaceDeaf && (
            <Tooltip content="Space Deafened">
              <HeadphonesOffIcon weight="fill" color={theme.colors.danger} />
            </Tooltip>
          )}
        </Stack>
      </Paper>
    );
  }
);
