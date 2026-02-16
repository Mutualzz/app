import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaCrown } from "react-icons/fa";
import type { ColorLike } from "@mutualzz/ui-core";
import { useMenu } from "@contexts/ContextMenu.context.tsx";

interface Props {
    member: SpaceMember;
    isOwner?: boolean;
}

export const MemberListItem = observer(({ member, isOwner }: Props) => {
    const [hovered, setHovered] = useState(false);
    const { theme } = useTheme();
    const { openContextMenu } = useMenu();

    const nameColor: ColorLike =
        (member.highestRole?.color as ColorLike) ?? "#99aab5";

    return (
        <Paper
            maxWidth={224}
            onMouseOver={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            variant={hovered ? "soft" : "plain"}
            py={1}
            borderRadius={8}
            direction="row"
            height={42}
            spacing={1}
            alignItems="center"
            px={1}
            onContextMenu={(e) =>
                openContextMenu(e, {
                    type: "member",
                    space: member.space!,
                    member,
                })
            }
            css={{
                cursor: "pointer",
            }}
        >
            <UserAvatar size={32} user={member.user} />
            <Typography
                flex={1}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                fontSize={16}
                direction="row"
                alignItems="center"
                display="flex"
                spacing={2}
                textColor={nameColor}
            >
                {member.displayName}
                {isOwner && (
                    <Tooltip content={<TooltipWrapper>Owner</TooltipWrapper>}>
                        <FaCrown
                            color={theme.colors.warning}
                            css={{
                                marginBottom: 4,
                            }}
                            size={14}
                        />
                    </Tooltip>
                )}
            </Typography>
        </Paper>
    );
});
