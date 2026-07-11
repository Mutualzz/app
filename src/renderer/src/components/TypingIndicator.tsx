import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useTranslation } from "react-i18next";

export const TypingIndicator = observer(
  ({ channelId }: { channelId: string }) => {
    const app = useAppStore();
    const { t } = useTranslation("chat");
    const users = app.typing.getUsersTyping(channelId);

    if (users.length === 0) return null;

    const text =
      users.length === 1
        ? t("typing.one", { name: users[0].displayName })
        : users.length === 2
          ? t("typing.two", {
              name1: users[0].displayName,
              name2: users[1].displayName
            })
          : t("typing.many", {
              name1: users[0].displayName,
              name2: users[1].displayName
            });

    return (
      <Paper
        borderTopLeftRadius={6}
        borderTopRightRadius={6}
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={1.25}
        alignItems="center"
        spacing={0.75}
      >
        <Stack direction="row" spacing={-2.5}>
          {users.slice(0, 3).map((user) => (
            <UserAvatar
              key={user.id}
              user={user}
              member={app.spaces.active?.members.get(user.id)}
              size="sm"
              badge={false}
            />
          ))}
        </Stack>
        <Typography textColor="secondary">{text}</Typography>
      </Paper>
    );
  }
);
