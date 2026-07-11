import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { UserAvatar } from "@components/User/UserAvatar";
import { useAppStore } from "@hooks/useStores";
import { type APIInvite, InviteType } from "@mutualzz/types";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isElectron } from "@utils/index";

export const Route = createFileRoute("/invite/$code")({
  component: observer(RouteComponent),
  validateSearch: (search) => ({
    deepLink: search.deepLink as boolean | undefined
  })
});

function RouteComponent() {
  const { t } = useTranslation("auth");
  const app = useAppStore();
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { deepLink } = Route.useSearch();

  const {
    data: invite,
    isLoading,
    error
  } = useQuery({
    queryKey: ["invite", code],
    queryFn: () => app.rest.get<APIInvite>(`/invites/${code}`),
    retry: 2,
    enabled: !!code
  });

  const isFriendInvite =
    invite != null && Number(invite.type) === InviteType.Friend;
  const inviteUser = invite?.user ?? invite?.inviter;
  const inviteUserId = invite?.userId ?? invite?.inviterId;
  const relationship = inviteUserId
    ? app.relationships.getForMe(inviteUserId)
    : undefined;
  const isSelf = inviteUserId === app.account?.id;

  const isInSpace =
    !invite?.space?.members || !app.account?.id
      ? false
      : invite?.space.members.some((m) => m.userId === app.account?.id);

  useEffect(() => {
    if (!invite) return;

    if (isFriendInvite) {
      app.setJoining(code, null);
      setMounted(true);
      return;
    }

    app.setJoining(code, invite.space);
    setMounted(true);
  }, [invite, code, app, isFriendInvite]);

  const handleGoToSpace = () => {
    if (!invite?.spaceId || !invite?.channelId) return;
    app.setJoining(null, null);
    app.spaces.setActive(invite.spaceId);
    app.channels.setActive(invite.channelId);
    navigate({
      to: "/spaces/$spaceId/$channelId",
      params: { spaceId: invite.spaceId, channelId: invite.channelId },
      replace: true
    });
  };

  const { mutate: acceptInvite, isPending: isJoining } = useMutation({
    mutationKey: ["accept-invite", code],
    mutationFn: async () =>
      app.rest.put(`/spaces/${app.joiningSpace?.id}/members`, {
        channelId: invite?.channelId,
        code: invite?.code
      }),
    onSuccess: async () => {
      handleGoToSpace();
    }
  });

  const { mutate: acceptFriendInvite, isPending: isAddingFriend } = useMutation({
    mutationKey: ["accept-friend-invite", code],
    mutationFn: () => app.relationships.acceptFriendInvite(code),
    onSuccess: (relationship) => {
      app.relationships.update(relationship);
      app.setJoining(null, null);
      navigate({ to: "/@me/friends", replace: true });
    }
  });

  const friendActionLabel = relationship?.isFriend
    ? t("invite.friends")
    : relationship?.isOutgoingRequest
      ? t("invite.pending")
      : t("invite.addFriend");

  const [deepLinkTried, setDeepLinkTried] = useState(false);
  const [deepLinkFailed, setDeepLinkFailed] = useState(false);
  const deepLinkTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!code || deepLinkTried || isElectron) return;

    const protocolUrl = `mutualzz://invite/${encodeURIComponent(code)}`;

    const onVisibilityChange = () => {
      if (document.hidden) cleanup();
    };
    const onBlur = () => cleanup();

    const cleanup = () => {
      setDeepLinkFailed(false);
      setDeepLinkTried(true);
      if (deepLinkTimeoutRef.current) {
        window.clearTimeout(deepLinkTimeoutRef.current);
        deepLinkTimeoutRef.current = null;
      }
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };

    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    deepLinkTimeoutRef.current = window.setTimeout(() => {
      setDeepLinkFailed(true);
      setDeepLinkTried(true);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    }, 2000);

    try {
      const anyNavigator = navigator as unknown as {
        msLaunchUri?: (
          uri: string,
          success?: () => void,
          failure?: () => void
        ) => void;
      };
      if (anyNavigator.msLaunchUri) {
        anyNavigator.msLaunchUri(
          protocolUrl,
          () => cleanup(),
          () => {
            setDeepLinkFailed(true);
            setDeepLinkTried(true);
            window.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onBlur);
          }
        );
      } else {
        window.location.href = protocolUrl;
      }
    } catch {
      setDeepLinkFailed(true);
      setDeepLinkTried(true);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    }

    return () => {
      if (deepLinkTimeoutRef.current) {
        window.clearTimeout(deepLinkTimeoutRef.current);
        deepLinkTimeoutRef.current = null;
      }
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [code, deepLinkTried, isElectron]);

  useEffect(() => {
    if (deepLink && mounted && invite && !isFriendInvite) {
      if (!app.token) return;
      if (isInSpace) {
        handleGoToSpace();
        return;
      }
      acceptInvite();
    }
  }, [invite, deepLink, mounted, app.token, isInSpace, acceptInvite, isFriendInvite]);

  if (!app.token && mounted && !deepLink)
    return <Navigate to="/login" replace />;

  const handleContinue = () => navigate({ to: "/", replace: true });

  if (!invite && error) return <Navigate to="/" replace />;

  if (deepLink && invite && !isFriendInvite) {
    return (
      <Stack
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Paper
          justifyContent="center"
          minWidth={450}
          minHeight={300}
          maxWidth={450}
          maxHeight={300}
          direction="column"
          p={2}
          borderRadius={10}
          elevation={3}
        >
          <Stack justifyContent="center" alignItems="center" flex={1} spacing={2} direction="column">
            {invite?.space && <SpaceIcon space={invite.space} size={48} />}
            <Typography level="h5" fontWeight="bold">
              {invite?.space?.name
                ? t("invite.joiningSpace", { spaceName: invite.space.name })
                : t("invite.joining")}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Paper
        justifyContent="center"
        minWidth={450}
        minHeight={300}
        maxWidth={450}
        maxHeight={300}
        direction="column"
        p={2}
        borderRadius={10}
        elevation={3}
      >
        {isLoading && (
          <Stack justifyContent="center" alignItems="center" flex={1}>
            <Typography level="h5" fontWeight="bold">
              {t("invite.loading")}
            </Typography>
          </Stack>
        )}

        {!isLoading && invite && isFriendInvite && (
          <>
            <Stack justifyContent="center" alignItems="center" flex={1}>
              <Stack direction="column" spacing={2} alignItems="center">
                {inviteUser ? (
                  <>
                    <UserAvatar user={inviteUser} size={64} />
                    <Typography textAlign="center">
                      {inviteUser.globalName ?? inviteUser.username}
                    </Typography>
                  </>
                ) : (
                  <Typography textAlign="center" fontWeight="bold">
                    {t("invite.friendInvite")}
                  </Typography>
                )}
                <Typography level="body-sm" textColor="secondary" textAlign="center">
                  {t("invite.wantsToBeFriend")}
                </Typography>
              </Stack>
            </Stack>

            <Stack px={10} mb={4} spacing={1.5}>
              <Button
                expand
                onClick={() => acceptFriendInvite()}
                disabled={
                  isAddingFriend ||
                  isSelf ||
                  relationship?.isFriend ||
                  relationship?.isOutgoingRequest
                }
              >
                {isSelf ? t("invite.thisIsYourInviteLink") : friendActionLabel}
              </Button>
            </Stack>
          </>
        )}

        {!isLoading && invite && invite.space && !isFriendInvite && (
          <>
            <Stack justifyContent="center" alignItems="center" flex={1}>
              <Stack direction="column" spacing={2} alignItems="center">
                <SpaceIcon space={invite.space} size={48} />
                <Typography>
                  {t("invite.invitedYouToJoin", {
                    name:
                      invite.inviter?.globalName ?? invite.inviter?.username ?? ""
                  })}
                </Typography>
                <Typography level="h2" fontWeight="bold">
                  {invite.space.name}
                </Typography>
              </Stack>
            </Stack>

            {!isElectron && deepLinkFailed && (
              <Stack px={6} mb={1.5} textAlign="center">
                <Typography level="body-md">
                  {t("invite.deepLinkFailed")}
                </Typography>
              </Stack>
            )}

            <Stack px={10} mb={4} spacing={1.5}>
              <Button
                expand
                onClick={isInSpace ? handleGoToSpace : () => acceptInvite()}
                disabled={isJoining}
              >
                {isInSpace ? t("invite.goToSpace") : t("invite.acceptInBrowser")}
              </Button>

              {!isElectron && (
                <Button
                  variant="outlined"
                  expand
                  onClick={() => {
                    setDeepLinkTried(false);
                    setDeepLinkFailed(false);
                  }}
                >
                  {t("invite.openInApp")}
                </Button>
              )}
            </Stack>
          </>
        )}

        {!invite && !isLoading && (
          <>
            <Stack
              justifyContent="center"
              alignItems="center"
              flex={1}
              spacing={2}
              direction="column"
              textAlign="center"
            >
              <Typography level="h5" fontWeight="bold">
                {t("invite.invalidTitle")}
              </Typography>
              <Typography>{t("invite.invalidDescription")}</Typography>
            </Stack>
            <Stack mx={7.5} mb={2.5}>
              <Button color="success" fullWidth onClick={handleContinue}>
                {t("actions.continueToMutualzz")}
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Stack>
  );
}
