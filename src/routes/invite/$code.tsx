import { Paper } from "@components/Paper";
import { SpaceIcon } from "@components/Space/SpaceIcon";
import { useAppStore } from "@hooks/useStores";
import { type APIInvite } from "@mutualzz/types";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { isTauri } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/invite/$code")({
    component: observer(RouteComponent),
    validateSearch: (search) => ({
        deepLink: search.deepLink as boolean | undefined,
    }),
});

function RouteComponent() {
    const app = useAppStore();
    const { code } = Route.useParams();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const { deepLink } = Route.useSearch();

    const {
        data: invite,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["space-invite", code],
        queryFn: async () => app.rest.get<APIInvite>(`/invites/${code}`),
        retry: 2,
        enabled: !!code,
    });

    const isInSpace = useMemo(() => {
        if (!invite?.space?.members || !app.account?.id) return false;
        return invite.space.members.some((m) => m.userId === app.account!.id);
    }, [invite?.space?.members, app.account]);

    useEffect(() => {
        if (!invite) return;
        app.setJoining(code, invite.space);
        setMounted(true);
    }, [invite, code, app]);

    const handleGoToSpace = () => {
        if (!invite?.spaceId || !invite?.channelId) return;
        app.setJoining(null, null);
        app.spaces.setActive(invite.spaceId);
        app.channels.setActive(invite.channelId);
        navigate({
            to: "/spaces/$spaceId/$channelId",
            params: { spaceId: invite.spaceId, channelId: invite.channelId },
            replace: true,
        });
    };

    const { mutate: acceptInvite, isPending: isJoining } = useMutation({
        mutationKey: ["accept-invite", code],
        mutationFn: async () =>
            app.rest.put(`/spaces/${app.joiningSpace?.id}/members`, {
                channelId: invite?.channelId,
                code: invite?.code,
            }),
        onSuccess: async () => {
            handleGoToSpace();
        },
    });

    const [deepLinkTried, setDeepLinkTried] = useState(false);
    const [deepLinkFailed, setDeepLinkFailed] = useState(false);
    const deepLinkTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!code || deepLinkTried || isTauri) return;

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
                    failure?: () => void,
                ) => void;
            };
            if (anyNavigator.msLaunchUri) {
                anyNavigator.msLaunchUri(
                    protocolUrl,
                    () => cleanup(),
                    () => {
                        setDeepLinkFailed(true);
                        setDeepLinkTried(true);
                        window.removeEventListener(
                            "visibilitychange",
                            onVisibilityChange,
                        );
                        window.removeEventListener("blur", onBlur);
                    },
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
    }, [code, deepLinkTried, isTauri]);

    useEffect(() => {
        if (deepLink && mounted && invite) {
            if (!app.token) return;
            if (isInSpace) {
                handleGoToSpace();
                return;
            }
            acceptInvite();
        }
    }, [
        invite,
        deepLink,
        mounted,
        app.token,
        isInSpace,
        acceptInvite,
        isTauri,
    ]);

    if (!app.token && mounted && !deepLink)
        return <Navigate to="/login" replace />;

    const handleContinue = () => navigate({ to: "/", replace: true });

    if (!invite && error) return <Navigate to="/" replace />;
    if (deepLink) return null;

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
                            Loading invite...
                        </Typography>
                    </Stack>
                )}

                {!isLoading && invite && invite.space && (
                    <>
                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            flex={1}
                        >
                            <Stack
                                direction="column"
                                spacing={2}
                                alignItems="center"
                            >
                                <SpaceIcon space={invite.space} size={48} />
                                <Typography>
                                    {(invite.inviter?.globalName ??
                                        invite.inviter?.username) +
                                        " invited you to join"}
                                </Typography>
                                <Typography level="h2" fontWeight="bold">
                                    {invite.space.name}
                                </Typography>
                            </Stack>
                        </Stack>

                        {/* Show fallback only when not in Tauri */}
                        {!isTauri && deepLinkFailed && (
                            <Stack px={6} mb={1.5} textAlign="center">
                                <Typography level="body-md">
                                    It looks like the Mutualzz app did not
                                    respond. You can accept the invite here in
                                    your browser.
                                </Typography>
                            </Stack>
                        )}

                        <Stack px={10} mb={4} spacing={1.5}>
                            <Button
                                fullWidth
                                onClick={
                                    isInSpace
                                        ? handleGoToSpace
                                        : () => acceptInvite()
                                }
                                disabled={isJoining}
                            >
                                {isInSpace
                                    ? "Go to space"
                                    : "Accept in browser"}
                            </Button>

                            {/* Hide "Open in app" inside Tauri */}
                            {!isTauri && (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        setDeepLinkTried(false);
                                        setDeepLinkFailed(false);
                                    }}
                                >
                                    Open in app
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
                                Invite Invalid
                            </Typography>
                            <Typography>
                                This invite may be expired, or you might not
                                have permission to join it.
                            </Typography>
                        </Stack>
                        <Stack mx={7.5} mb={2.5}>
                            <Button
                                color="success"
                                fullWidth
                                onClick={handleContinue}
                            >
                                Continue to Mutualzz
                            </Button>
                        </Stack>
                    </>
                )}
            </Paper>
        </Stack>
    );
}
