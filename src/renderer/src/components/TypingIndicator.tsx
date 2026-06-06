import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { Paper } from "@components/Paper";
import { UserAvatar } from "@components/User/UserAvatar";

export const TypingIndicator = observer(
  ({ channelId }: { channelId: string }) => {
    const app = useAppStore();
    const users = app.typing.getUsersTyping(channelId);

    if (users.length === 0) return null;

    const text =
      users.length === 1
        ? `${users[0].displayName} is typing...`
        : users.length === 2
          ? `${users[0].displayName} and ${users[1].displayName} are typing...`
          : `${users[0].displayName}, ${users[1].displayName}, and others are typing...`;

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
            <UserAvatar key={user.id} user={user} size="sm" badge={false} />
          ))}
        </Stack>
        <Typography textColor="secondary">{text}</Typography>
      </Paper>
    );
  }
);
