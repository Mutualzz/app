import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaCrown } from "react-icons/fa";
import type { ColorLike } from "@mutualzz/ui-core";
import { useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { SmallActivityStatus } from "@components/SmallActivityStatus";

interface Props {
    member: SpaceMember;
    isOwner?: boolean;
}

export const MemberListItem = observer(({ member, isOwner }: Props) => {
    const app = useAppStore();
    const [hovered, setHovered] = useState(false);
    const { theme } = useTheme();
    const { openContextMenu } = useMenu();

    const nameColor: ColorLike =
        (member.highestRole?.color as ColorLike) ??
        (hovered ? theme.typography.colors.primary : "#99aab5");

    const presence = app.presence.get(member.userId);

    const channelId = app.channels.activeId;

    return (
        <Paper
            maxWidth={224}
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant={hovered ? "soft" : "plain"}
            borderRadius={8}
            direction="row"
            alignItems="center"
            spacing={1.75}
            p={1}
            onContextMenu={(e) =>
                openContextMenu(e, {
                    type: "user",
                    space: member.space,
                    member,
                    user: member.user!
                })
            }
            css={{
                cursor: "pointer",
                ...(presence &&
                    presence.status === "offline" &&
                    !hovered && {
                        opacity: 0.5
                    })
            }}
        >
            <UserAvatar
                user={member.user}
                badge
                typing={
                    channelId && member.userId
                        ? app.typing.isUserTyping(channelId, member.userId)
                        : false
                }
            />
            <Stack direction="column">
                <Typography
                    flex={1}
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    fontSize={16}
                    direction="row"
                    alignItems="center"
                    display="flex"
                    spacing={1.25}
                    level="body-sm"
                    textColor={nameColor}
                >
                    {member.displayName}
                    {isOwner && (
                        <Tooltip
                            content={<TooltipWrapper>Owner</TooltipWrapper>}
                        >
                            <FaCrown
                                color={theme.colors.warning}
                                css={{
                                    marginBottom: 4
                                }}
                                size={14}
                            />
                        </Tooltip>
                    )}
                </Typography>
                {presence && <SmallActivityStatus presence={presence} />}
            </Stack>
        </Paper>
    );
});
