import { observer } from "mobx-react-lite";
import { Snowflake } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { RenderElementProps } from "slate-react";
import { useMenu } from "@contexts/ContextMenu.context";

interface Props {
  userId: Snowflake;
  attributes?: RenderElementProps["attributes"];
}

export const UserMention = observer(({ userId, attributes }: Props) => {
  const app = useAppStore();
  const { theme } = useTheme();
  const { openContextMenu } = useMenu();
  const space = app.spaces.active;

  const member = space?.members.get(userId);
  const user = app.users.get(userId);

  if (!user) return null;

  return (
    <Stack
      {...attributes}
      contentEditable={false}
      spacing={0.75}
      px={0.5}
      inline
      css={{
        background: `${theme.colors.info}22`,
        borderRadius: 4,
        userSelect: "none",
        "&:hover": {
          background: `${theme.colors.info}66`
        },
        overflow: "hidden"
      }}
      onContextMenu={(e) =>
        openContextMenu(e, {
          type: "user",
          user,
          member
        })
      }
    >
      <span style={{ position: "relative", top: 3 }}>
        <UserAvatar size={16} user={user} member={member} popout />
      </span>
      <Typography>
        @{member?.displayName || user?.displayName || "Deleted User"}
      </Typography>
    </Stack>
  );
});
