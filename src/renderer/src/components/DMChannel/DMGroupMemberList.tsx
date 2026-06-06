import { observer } from "mobx-react-lite";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { DMGroupMemberListItem } from "@components/DMChannel/DMGroupMemberListItem";
import { Stack, Typography } from "@mutualzz/ui-web";

export const DMGroupMemberList = observer(() => {
  const app = useAppStore();
  const channel = app.channels.active;

  const sortedByStatus = channel?.dmRecipients.toSorted((a, b) => {
    const aOnline = app.presence.get(a.id)?.status === "online" ? -1 : 1;
    const bOnline = app.presence.get(b.id)?.status === "online" ? -1 : 1;
    return aOnline - bOnline;
  });

  return (
    <Paper
      elevation={app.settings?.preferEmbossed ? 5 : 0}
      direction="column"
      flex="0 0 240px"
      overflowX="hidden"
      borderTop="0 !important"
      borderRight="0 !important"
      borderBottom="0 !important"
      px={1.75}
      py={1.25}
      spacing={1.25}
    >
      <Typography>Members - {channel?.recipients?.length}</Typography>
      <Stack direction="column" flex="1 1 auto" overflowY="auto" spacing={2.5}>
        {sortedByStatus?.map((user) => (
          <DMGroupMemberListItem
            user={user}
            isOwner={channel?.ownerId === user.id}
          />
        ))}
      </Stack>
    </Paper>
  );
});
