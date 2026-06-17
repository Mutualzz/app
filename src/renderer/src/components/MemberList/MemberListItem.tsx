import { Paper } from "@components/Paper";
import { UserProfilePopoutTrigger } from "@components/Profile/popout/UserProfilePopoutTrigger";
import { UserAvatar } from "@components/User/UserAvatar";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import type { SpaceMember } from "@stores/objects/SpaceMember";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import type { ColorLike } from "@mutualzz/ui-core";
import { useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { CrownSimpleIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

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
    <UserProfilePopoutTrigger
      user={member.user!}
      member={member}
      fullWidth
      placement="left"
    >
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
          width: "100%",
          ...(presence &&
            presence.status === "offline" &&
            !hovered && {
              opacity: 0.5
            })
        }}
      >
        <UserAvatar
          user={member.user}
          member={member}
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
          spacing={0.75}
          level="body-sm"
          textColor={nameColor}
        >
          {member.displayName}
          {isOwner && (
            <Tooltip content="Owner">
              <CrownSimpleIcon
                weight="fill"
                color={theme.colors.warning}
                size={14}
              />
            </Tooltip>
          )}
        </Typography>
        {presence && <SmallActivityStatus presence={presence} />}
        </Stack>
      </Paper>
    </UserProfilePopoutTrigger>
  );
});
