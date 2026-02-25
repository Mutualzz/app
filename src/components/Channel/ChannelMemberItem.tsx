import { observer } from "mobx-react-lite";
import type { VoiceState } from "@mutualzz/types";
import { Paper } from "@components/Paper.tsx";
import { useState } from "react";
import { useMenu } from "@contexts/ContextMenu.context.tsx";
import { UserAvatar } from "@components/User/UserAvatar.tsx";
import type { ColorLike } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdHeadsetOff } from "react-icons/md";
import type { Space } from "@stores/objects/Space.ts";

interface Props {
    space: Space;
    state: VoiceState;
}

export const ChannelMemberItem = observer(({ space, state }: Props) => {
    const [hovered, setHovered] = useState(false);
    const { openContextMenu } = useMenu();
    const { theme } = useTheme();

    const member = space.members.get(state.userId);

    if (!member) return null;

    const nameColor: ColorLike =
        (member.highestRole?.color as ColorLike) ??
        (hovered ? theme.typography.colors.primary : "#99aab5");

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
            onContextMenu={(e) =>
                openContextMenu(e, {
                    type: "member",
                    space: member.space!,
                    member,
                })
            }
        >
            <Stack spacing={1} alignItems="center">
                <UserAvatar user={member.user} size={24} />
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
            <Stack spacing={1.25} alignItems="center">
                {state.selfMute && <FaMicrophoneSlash />}
                {state.selfDeaf && <MdHeadsetOff />}
                {state.spaceMute && (
                    <FaMicrophoneSlash color={theme.colors.danger} />
                )}
                {state.spaceDeaf && (
                    <MdHeadsetOff color={theme.colors.danger} />
                )}
            </Stack>
        </Paper>
    );
});
