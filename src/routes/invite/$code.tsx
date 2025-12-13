import { Paper } from "@components/Paper.tsx";
import { SpaceIcon } from "@components/Space/SpaceIcon.tsx";
import { useAppStore } from "@hooks/useStores";
import { type APIInvite } from "@mutualzz/types";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/invite/$code")({
    component: observer(RouteComponent),
});

// TODO: Finish invite system properly, implement an opener that opens invite links in the app, otherwise continue on web
function RouteComponent() {
    const app = useAppStore();
    const { code } = Route.useParams();
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    const { data: invite, isLoading } = useQuery({
        queryKey: ["space-invite", code],
        queryFn: async () => app.rest.get<APIInvite>(`/invites/${code}`),
        retry: 2,
    });

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

    useEffect(() => {
        if (!invite) return;
        app.setJoining(code, invite.space);
        setMounted(true);
    }, [invite]);

    if (!app.token && mounted) return <Navigate to="/login" replace />;

    const handleAcceptInvite = async () => {
        acceptInvite();
    };

    const handleGoToSpace = () => {
        if (!invite) return;
        app.setJoining(null, null);
        if (invite)
            navigate({
                to: `/spaces/${invite.space?.id}/${invite.channelId}`,
                replace: true,
            });
    };

    const handleContinue = () => {
        navigate({ to: "/", replace: true });
    };

    const isInSpace = invite?.space?.members?.some(
        (member) => member.userId === app.account?.id || "",
    );

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
                                have permission to join it
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
                {invite && invite.space && (
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
                                    {invite.inviter?.globalName ??
                                        invite.inviter?.username}{" "}
                                    invited you to join
                                </Typography>
                                <Typography level="h2" fontWeight="bold">
                                    {invite.space.name}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack px={10} mb={4}>
                            <Button
                                fullWidth
                                onClick={
                                    isInSpace
                                        ? handleGoToSpace
                                        : handleAcceptInvite
                                }
                                disabled={isJoining}
                            >
                                {isInSpace ? "Go to space" : "Accept invite"}
                            </Button>
                        </Stack>
                    </>
                )}
            </Paper>
        </Stack>
    );
}
