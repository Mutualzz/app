import { Input, Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@renderer/hooks/useStores";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Button } from "../Button";
import { useMutation } from "@tanstack/react-query";
import {
  HttpException,
  HttpStatusCode,
  RelationshipType
} from "@mutualzz/types";
import { toast } from "react-toastify";

export const AddFriendTab = observer(() => {
  const app = useAppStore();
  const [identifier, setIdentifier] = useState("");

  const trimmed = identifier.trim();

  const matchingRelationship = app.relationships.all.find(
    (r) => r.otherUser?.username === trimmed || r.otherUserId === trimmed
  );

  const isBlocked = matchingRelationship?.type === RelationshipType.Blocked;
  const isFriend = matchingRelationship?.type === RelationshipType.Friend;
  const alreadySent =
    matchingRelationship?.type === RelationshipType.OutgoingRequest;

  const buttonLabel = isFriend
    ? "Already friends"
    : alreadySent
      ? "Already sent request"
      : "Send Request";

  const isDisabled = !trimmed || isBlocked || isFriend || alreadySent;

  const { mutate: sendFriendRequest } = useMutation({
    mutationFn: () => app.relationships.sendFriendRequest(identifier),
    onError: (err: HttpException) => {
      const status = err instanceof HttpException ? err.status : null;
      const message =
        status === HttpStatusCode.NotFound
          ? "Unknown username, please make sure the username is correct"
          : err instanceof Error
            ? err.message
            : "Unknown username, please make sure the username is correct";
      toast.error(message);
    }
  });

  return (
    <Stack
      direction="column"
      flex={1}
      spacing={1.25}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isDisabled) {
          sendFriendRequest();
        }
      }}
    >
      <Typography level="body-lg">Add Friend</Typography>
      <Typography textColor="secondary">
        You can add friends by their Mutualzz username.
      </Typography>
      <Input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Enter username"
        css={{
          padding: 6
        }}
        endDecorator={
          <Button
            color="primary"
            onClick={() => sendFriendRequest()}
            disabled={isDisabled}
          >
            {buttonLabel}
          </Button>
        }
      />
    </Stack>
  );
});
