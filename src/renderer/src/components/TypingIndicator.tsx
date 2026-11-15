import { interpolateNodes, nameToken } from "@utils/interpolateNodes";
import { UserDisplayName } from "@components/User/UserDisplayName";
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

    if (app.settings?.showTypingIndicators === false) {
      return null;
    }

    const users = app.typing.getUsersTyping(channelId);

    if (users.length === 0) return null;

    const styledNames = users.slice(0, 2).map((user) => (
      <UserDisplayName
        key={user.id}
        userId={user.id}
        nameStyle={user.displayNameStyle}
      >
        {user.displayName}
      </UserDisplayName>
    ));

    const template =
      users.length === 1
        ? t("typing.one", { name: nameToken(0) })
        : users.length === 2
          ? t("typing.two", { name1: nameToken(0), name2: nameToken(1) })
          : t("typing.many", { name1: nameToken(0), name2: nameToken(1) });

    const text = interpolateNodes(template, styledNames);

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
        <Typography
          textColor="secondary"
          css={{ fontSize: "calc(1em * var(--chat-font-scale, 1))" }}
        >
          {text}
        </Typography>
      </Paper>
    );
  }
);
