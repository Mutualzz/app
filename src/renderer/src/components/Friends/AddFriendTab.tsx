import { Divider, Input, Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@renderer/hooks/useStores";
import { Invite } from "@stores/objects/Invite";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  HttpException,
  HttpStatusCode,
  RelationshipType
} from "@mutualzz/types";
import { toast } from "react-toastify";
import { isElectron } from "@utils/index";
import { CopyIcon } from "@phosphor-icons/react";

export const AddFriendTab = observer(() => {
  const app = useAppStore();
  const [identifier, setIdentifier] = useState("");
  const [copied, setCopied] = useState(false);

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

  const {
    data: friendInvite,
    isLoading: isLoadingFriendInvite,
    refetch: refetchFriendInvite
  } = useQuery({
    queryKey: ["friend-invite"],
    queryFn: () => app.relationships.getFriendInvite()
  });

  const { mutate: createFriendInvite, isPending: isCreatingFriendInvite } =
    useMutation({
      mutationFn: () => app.relationships.createFriendInvite(),
      onSuccess: () => refetchFriendInvite()
    });

  useEffect(() => {
    if (isLoadingFriendInvite || friendInvite || isCreatingFriendInvite) return;
    createFriendInvite();
  }, [
    isLoadingFriendInvite,
    friendInvite,
    isCreatingFriendInvite,
    createFriendInvite
  ]);

  const friendInviteUrl = friendInvite
    ? Invite.constructUrl(friendInvite.code)
    : "";

  const copyFriendInvite = async () => {
    if (!friendInviteUrl) return;

    if (isElectron) await window.api.clipboard.write(friendInviteUrl);
    else await navigator.clipboard.writeText(friendInviteUrl);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Stack
      direction="column"
      flex={1}
      spacing={2.5}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isDisabled) {
          sendFriendRequest();
        }
      }}
    >
      <Stack direction="column" spacing={1.25}>
        <Typography level="body-lg">Add Friend</Typography>
        <Typography textColor="secondary">
          You can add friends with their Mutualzz username.
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

      <Divider />

      <Stack direction="column" spacing={1.25}>
        <Typography level="body-lg">Your Friend Link</Typography>
        <Typography textColor="secondary">
          Share this link to let people send you a friend request. They will see
          an Add Friend button in chat.
        </Typography>

        {!friendInvite && (isLoadingFriendInvite || isCreatingFriendInvite) && (
          <Typography textColor="secondary">Creating your friend link...</Typography>
        )}

        {friendInvite && (
          <Input
            type="text"
            readOnly
            value={friendInviteUrl}
            fullWidth
            endDecorator={
              <Button
                padding={4}
                startDecorator={<CopyIcon />}
                variant="soft"
                color="neutral"
                onClick={copyFriendInvite}
                disabled={copied}
                size="sm"
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            }
          />
        )}
      </Stack>
    </Stack>
  );
});
