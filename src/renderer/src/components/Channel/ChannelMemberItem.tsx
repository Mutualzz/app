import { observer } from "mobx-react-lite";
import { Paper } from "@components/Paper";
import { useState } from "react";
import { useAppStore } from "@hooks/useStores";
import { useMenu } from "@contexts/ContextMenu.context";
import { UserAvatar } from "@components/User/UserAvatar";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdHeadsetOff, MdVideocam } from "react-icons/md";
import type { Space } from "@stores/objects/Space";
import { TooltipWrapper } from "@components/TooltipWrapper";
import type { VoiceState } from "@stores/objects/VoiceState.ts";

interface Props {
    space: Space;
    state: VoiceState;
}

export const ChannelMemberItem = observer(({ space, state }: Props) => {
    const app = useAppStore();
    const [hovered, setHovered] = useState(false);
    const { openContextMenu } = useMenu();
    const { theme } = useTheme();

    const member = space.members.get(state.userId);
    if (!member) return null;

    const videoOn =
        app.account?.id === state.userId
            ? !!app.voice.getLocalCameraStream()
            : !!app.voice.getVideoStreamForUser(member.id);

    const isStale = !!state.disconnectedAt;
    const isOtherClient =
        state.sessionId !== app.voice.currentSessionId &&
        state.userId === app.account?.id;

    const isSubtle = isStale || isOtherClient;

    const nameColor: ColorLike = isSubtle
        ? "#99aab5"
        : ((member.highestRole?.color as ColorLike) ??
          (hovered ? theme.typography.colors.primary : "#99aab5"));

    const speaking = app.voice.isUserSpeaking(member.id);

    return (
        <Paper
            width="100%"
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant={hovered ? "soft" : "plain"}
            borderRadius={8}
            alignItems="center"
            height={32}
            px={1}
            justifyContent="space-between"
            css={{
                opacity: isSubtle ? 0.55 : 1
            }}
            onContextMenu={(e) =>
                openContextMenu(e, {
                    type: "user",
                    space: member.space,
                    member,
                    user: member.user!
                })
            }
        >
            <Stack spacing={1.75} alignItems="center">
                <UserAvatar user={member.user} size={24} speaking={speaking} />
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
                {videoOn && (
                    <Tooltip content={<TooltipWrapper>Video</TooltipWrapper>}>
                        <MdVideocam />
                    </Tooltip>
                )}
                {state.selfMute && !state.spaceMute && (
                    <Tooltip content={<TooltipWrapper>Muted</TooltipWrapper>}>
                        <FaMicrophoneSlash />
                    </Tooltip>
                )}
                {state.spaceMute && (
                    <Tooltip
                        content={<TooltipWrapper>Space Muted</TooltipWrapper>}
                    >
                        <FaMicrophoneSlash color={theme.colors.danger} />
                    </Tooltip>
                )}
                {state.selfDeaf && (
                    <Tooltip
                        content={<TooltipWrapper>Deafened</TooltipWrapper>}
                    >
                        <MdHeadsetOff />
                    </Tooltip>
                )}
                {state.spaceDeaf && (
                    <Tooltip
                        content={
                            <TooltipWrapper>Space Deafened</TooltipWrapper>
                        }
                    >
                        <MdHeadsetOff color={theme.colors.danger} />
                    </Tooltip>
                )}
            </Stack>
        </Paper>
    );
});
