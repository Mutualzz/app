import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import type { APICodedLink } from "@mutualzz/types";
import { InviteType } from "@mutualzz/types";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import type { MouseEvent } from "react";
import { CheckIcon } from "@phosphor-icons/react";

interface Props {
  link: APICodedLink;
}

const FriendCodedLinkPreview = observer(({ link }: { link: APICodedLink }) => {
  const app = useAppStore();
  const navigate = useNavigate();

  const user = link.user ?? link.inviter;
  const userId = user?.id;
  const displayName = user?.globalName ?? user?.username ?? "Someone";
  const isSelf = userId === app.account?.id;
  const relationship = userId ? app.relationships.getForMe(userId) : undefined;

  const { mutate: addFriend, isPending } = useMutation({
    mutationFn: () => app.relationships.acceptFriendInvite(link.code),
    onSuccess: (result) => {
      app.relationships.update(result);
    }
  });

  const actionLabel = relationship?.isFriend
    ? "Friends"
    : relationship?.isOutgoingRequest
      ? "Pending"
      : "Add Friend";

  const actionDisabled =
    isPending ||
    isSelf ||
    relationship?.isFriend ||
    relationship?.isOutgoingRequest;

  const openInvite = (e: MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: "/invite/$code",
      params: { code: link.code }
    });
  };

  return (
    <Paper
      direction="row"
      width="20rem"
      borderRadius={8}
      p={2}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      elevation={app.settings?.preferEmbossed ? 3 : 0}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        minWidth={0}
        css={{ cursor: "pointer", flex: 1 }}
        onClick={openInvite}
      >
        <UserAvatar user={user} size={40} />
        <Stack direction="column" spacing={0.25} minWidth={0}>
          <Typography
            fontWeight="bold"
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {displayName}
          </Typography>
          {user?.username && (
            <Typography level="body-xs" textColor="secondary">
              @{user.username}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Button
        size="sm"
        variant="solid"
        color="success"
        disabled={actionDisabled}
        onClick={() => {
          if (actionDisabled) return;
          addFriend();
        }}
        startDecorator={relationship?.isFriend ? <CheckIcon /> : undefined}
      >
        {isSelf ? "You" : actionLabel}
      </Button>
    </Paper>
  );
});

export const CodedLinkPreview = observer(({ link }: Props) => {
  const app = useAppStore();
  const navigate = useNavigate();

  if (link.type === InviteType.Friend)
    return <FriendCodedLinkPreview link={link} />;

  const openInvite = () =>
    navigate({
      to: "/invite/$code",
      params: { code: link.code }
    });

  const inviterName =
    link.inviter?.globalName ?? link.inviter?.username ?? "Someone";
  const memberCount = link.approximateMemberCount;
  const onlineCount = link.approximatePresenceCount;

  return (
    <Paper
      direction="column"
      width="20rem"
      borderRadius={8}
      p={2.5}
      spacing={1.5}
      css={{ cursor: "pointer" }}
      elevation={app.settings?.preferEmbossed ? 3 : 0}
      onClick={openInvite}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <SpaceIcon space={link.space} size={48} />
        <Stack direction="column" spacing={0.25} flex={1} minWidth={0}>
          <Typography
            fontWeight="bold"
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {link.space?.name ?? "Unknown Space"}
          </Typography>
          {(memberCount != null && memberCount > 0) ||
          (onlineCount != null && onlineCount > 0) ? (
            <Typography level="body-xs" textColor="secondary">
              {onlineCount != null && onlineCount > 0
                ? `${onlineCount.toLocaleString()} Online`
                : null}
              {onlineCount != null &&
              onlineCount > 0 &&
              memberCount != null &&
              memberCount > 0
                ? " • "
                : null}
              {memberCount != null && memberCount > 0
                ? `${memberCount.toLocaleString()} Member${
                    memberCount === 1 ? "" : "s"
                  }`
                : null}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <Typography level="body-xs" textColor="secondary">
        {inviterName} invited you to join
        {link.channel?.name ? ` #${link.channel.name}` : ""}
      </Typography>
    </Paper>
  );
});
