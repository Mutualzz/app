import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import type { ColorLike } from "@mutualzz/ui-core";
import { useMenu } from "@contexts/ContextMenu.context";
import { useAppStore } from "@hooks/useStores";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { User } from "@stores/objects/User";
import { CrownSimpleIcon } from "@phosphor-icons/react";
import { Tooltip } from "@components/Tooltip";

interface Props {
  user: User;
  isOwner?: boolean;
}

export const DMGroupMemberListItem = observer(({ user, isOwner }: Props) => {
  const app = useAppStore();
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();
  const { openContextMenu } = useMenu();

  const nameColor: ColorLike = theme.typography.colors.primary || "#99aab5";

  const presence = app.presence.get(user.id);

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
          user
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
      <UserAvatar user={user} badge />
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
          {user.displayName}
          {isOwner && (
            <Tooltip content="Owner">
              <CrownSimpleIcon
                weight="fill"
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
