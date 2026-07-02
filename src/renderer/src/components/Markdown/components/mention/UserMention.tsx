import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Snowflake } from "@mutualzz/types";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { UserAvatar } from "@components/User/UserAvatar";
import { RenderElementProps } from "slate-react";
import { useMenu } from "@contexts/ContextMenu.context";
import { UserProfilePopoutTrigger } from "@renderer/components/Profile/popout/UserProfilePopoutTrigger";

interface Props {
  userId: Snowflake;
  attributes?: RenderElementProps["attributes"];
  children?: ReactNode;
}

export const UserMention = observer(
  ({ userId, attributes, children }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openContextMenu } = useMenu();
    const space = app.spaces.active;

    const member = space?.members.get(userId);
    const user = app.users.get(userId);

    if (!user) return null;

    return (
      <UserProfilePopoutTrigger
        user={user}
        placement="right"
        triggerCss={{ verticalAlign: -2.5 }}
      >
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
            cursor: "pointer",
            "&:hover": {
              background: `${theme.colors.info}66`
            },
            overflow: "hidden"
          }}
          alignItems="center"
          onContextMenu={(e) =>
            openContextMenu(e, {
              type: "user",
              user,
              member
            })
          }
        >
          {children}
          <UserAvatar size={16} user={user} member={member} />
          <Typography
            lineHeight={1}
            css={{
              textAlign: "center",
              ":hover": { textDecoration: "underline" }
            }}
          >
            @{member?.displayName || user?.displayName || "Deleted User"}
          </Typography>
        </Stack>
      </UserProfilePopoutTrigger>
    );
  }
);
