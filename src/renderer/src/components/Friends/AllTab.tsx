import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { UserItem } from "./UserItem";
import { useAppStore } from "@renderer/hooks/useStores";

export const AllTab = observer(() => {
  const app = useAppStore();
  const relationships = app.relationships.friends;

  return (
    <Stack direction="column" flex={1} spacing={2.5}>
      {relationships.length === 0 && (
        <Stack
          direction="column"
          flex={1}
          justifyContent="center"
          alignItems="center"
          spacing={2.5}
        >
          <Typography textColor="muted" level="body-lg">
            You do not have any friends. Click the "Add Friend" button to send
            friend requests.
          </Typography>
        </Stack>
      )}
      {relationships.length > 0 && (
        <>
          <Typography>All - {relationships.length}</Typography>
          <Stack direction="column" flex={1} spacing={2.5}>
            {relationships.map((relationship) => (
              <UserItem key={relationship.id} relationship={relationship} />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
});
