import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { ColorLike } from "@mutualzz/ui-core";
import { IconSlot, Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { Space } from "@stores/objects/Space";
import type { VoiceState } from "@stores/objects/VoiceState.ts";
import { MicrophoneSlashIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { HeadphonesOffIcon } from "../icons/HeadphonesOffIcon";
import { Tooltip } from "@components/Tooltip";
import { observer } from "mobx-react-lite";

const STATUS_ICON_SIZE = 14;

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
        direction="row"
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
        <Stack direction="row" alignItems="center" spacing={1.75} flex={1} minWidth={0}>
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
            level="label-sm"
            textColor={nameColor}
          >
            {member.displayName}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.75}>
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
                level="label-xs"
                css={{ letterSpacing: "0.04em" }}
              >
                LIVE
              </Typography>
            </Paper>
          )}
          {videoOn && (
            <Tooltip content="Video">
              <IconSlot size={STATUS_ICON_SIZE}>
                <VideoCameraIcon weight="fill" />
              </IconSlot>
            </Tooltip>
          )}
          {state.selfMute && !state.spaceMute && (
            <Tooltip content="Muted">
              <IconSlot size={STATUS_ICON_SIZE}>
                <MicrophoneSlashIcon weight="fill" />
              </IconSlot>
            </Tooltip>
          )}
          {state.spaceMute && (
            <Tooltip content="Space Muted">
              <IconSlot size={STATUS_ICON_SIZE}>
                <MicrophoneSlashIcon
                  weight="fill"
                  color={theme.colors.danger}
                />
              </IconSlot>
            </Tooltip>
          )}
          {state.selfDeaf && (
            <Tooltip content="Deafened">
              <IconSlot size={STATUS_ICON_SIZE}>
                <HeadphonesOffIcon weight="fill" />
              </IconSlot>
            </Tooltip>
          )}
          {state.spaceDeaf && (
            <Tooltip content="Space Deafened">
              <IconSlot size={STATUS_ICON_SIZE}>
                <HeadphonesOffIcon
                  weight="fill"
                  color={theme.colors.danger}
                />
              </IconSlot>
            </Tooltip>
          )}
        </Stack>
      </Paper>
    );
  }
);
