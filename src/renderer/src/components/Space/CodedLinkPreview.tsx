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
import { useTranslation } from "react-i18next";

interface Props {
  link: APICodedLink;
}

const FriendCodedLinkPreview = observer(({ link }: { link: APICodedLink }) => {
  const { t } = useTranslation("auth");
  const { t: tChat } = useTranslation("chat");
  const app = useAppStore();
  const navigate = useNavigate();

  const user = link.user ?? link.inviter;
  const userId = user?.id;
  const displayName = user?.globalName ?? user?.username ?? tChat("someone");
  const isSelf = userId === app.account?.id;
  const relationship = userId ? app.relationships.getForMe(userId) : undefined;

  const { mutate: addFriend, isPending } = useMutation({
    mutationFn: () => app.relationships.acceptFriendInvite(link.code),
    onSuccess: (result) => {
      app.relationships.update(result);
    }
  });

  const actionLabel = relationship?.isFriend
    ? t("invite.friends")
    : relationship?.isOutgoingRequest
      ? t("invite.pending")
      : t("invite.addFriend");

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
        {isSelf ? tChat("you") : actionLabel}
      </Button>
    </Paper>
  );
});

export const CodedLinkPreview = observer(({ link }: Props) => {
  const { t } = useTranslation("auth");
  const { t: tChat } = useTranslation("chat");
  const { t: tSpace } = useTranslation("space");
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
    link.inviter?.globalName ?? link.inviter?.username ?? tChat("someone");
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
            {link.space?.name ?? tChat("unknownSpace")}
          </Typography>
          {(memberCount != null && memberCount > 0) ||
          (onlineCount != null && onlineCount > 0) ? (
            <Typography level="body-xs" textColor="secondary">
              {onlineCount != null && onlineCount > 0
                ? `${onlineCount.toLocaleString()} ${tChat("online")}`
                : null}
              {onlineCount != null &&
              onlineCount > 0 &&
              memberCount != null &&
              memberCount > 0
                ? " • "
                : null}
              {memberCount != null && memberCount > 0
                ? tSpace("roles.memberCount", { count: memberCount })
                : null}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      <Typography level="body-xs" textColor="secondary">
        {t("invite.invitedYouToJoin", { name: inviterName })}
        {link.channel?.name ? ` #${link.channel.name}` : ""}
      </Typography>
    </Paper>
  );
});
