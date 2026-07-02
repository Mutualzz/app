import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useAppStore } from "@renderer/hooks/useStores";
import { UserItem } from "./UserItem";

export const PendingTab = observer(() => {
  const app = useAppStore();

  const relationships = app.relationships.pending;

  const receiveRequests = relationships.filter((r) => r.isIncomingRequest);
  const sendRequests = relationships.filter((r) => r.isOutgoingRequest);

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
            There are no pending friend requests. Click the "Add Friend" button
            to send friend requests.
          </Typography>
        </Stack>
      )}
      {receiveRequests.length > 0 && (
        <>
          <Typography>Received - {receiveRequests.length}</Typography>
          <Stack direction="column" spacing={2.5}>
            {receiveRequests.map((relationship) => (
              <UserItem key={relationship.id} relationship={relationship} />
            ))}
          </Stack>
        </>
      )}
      {sendRequests.length > 0 && (
        <>
          <Typography>Sent - {sendRequests.length}</Typography>
          <Stack direction="column" spacing={2.5}>
            {sendRequests.map((relationship) => (
              <UserItem key={relationship.id} relationship={relationship} />
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
});
