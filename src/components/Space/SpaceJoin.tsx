import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Link } from "@components/Link";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import type { APIInvite } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    Input,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ChangeEvent, useState } from "react";

interface Props {
    setCreating: (creating: boolean) => void;
}

const exampleLink = "https://mutualzz.com/invite/fJ2XlEuD";

const regex = import.meta.env.DEV
    ? /^(?:(?:https?:\/\/)?(?:www\.)?localhost:1420\/invite\/)?([A-Za-z0-9_-]{8,})$/
    : /^(?:(?:https?:\/\/)?(?:www\.)?mutualzz\.com\/invite\/)?([A-Za-z0-9_-]{8,})$/;

export const SpaceJoin = observer(({ setCreating }: Props) => {
    const app = useAppStore();
    const [inviteLink, setInviteLink] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { closeAllModals } = useModal();

    const { mutate: joinSpace, isPending: isJoining } = useMutation({
        mutationKey: ["join-space", inviteLink],
        mutationFn: async (invite: APIInvite) =>
            app.rest.put(`/spaces/${invite.space?.id}/members`, {
                channelId: invite.channelId,
                code: invite.code,
            }),
        onSuccess: () => {
            closeAllModals();
        },
    });

    const { mutate: getInvite, isPending: isGettingInvite } = useMutation({
        mutationKey: ["get-invite", inviteLink],
        mutationFn: async () => {
            const match = inviteLink.match(regex);
            if (!match) {
                setError("Invalid invite link format.");
                return;
            }

            const code = match[1];

            return app.rest.get<APIInvite>(`/invites/${code}`);
        },
        onSuccess: (invite) => {
            if (!invite) return;

            joinSpace(invite);
        },
    });

    const handleJoin = () => {
        if (inviteLink.trim() === "") {
            setError("Invite link cannot be empty.");
            return;
        }

        getInvite();
    };

    const handleLink = (e: ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setInviteLink(e.target.value);
    };

    return (
        <AnimatedPaper
            borderRadius={12}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 400 }}
            maxWidth={500}
            direction="column"
            minHeight={300}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            spacing={0}
            elevation={2}
            p={{ xs: "1rem", sm: "2rem" }}
            transparency={10}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        >
            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                mb={10}
            >
                <Typography level="h5" fontWeight="bold">
                    Join a space
                </Typography>
                <Typography level="body-sm">
                    Enter an invite below to join an existing space
                </Typography>
            </Stack>

            <Stack
                direction="column"
                spacing={{ xs: 0.5, sm: 0.75, md: 0.875 }}
                width="100%"
            >
                <Typography
                    fontWeight={500}
                    level={{ xs: "body-sm", sm: "body-md" }}
                >
                    Invite Link{" "}
                    <Typography variant="plain" color="danger">
                        *
                    </Typography>
                </Typography>
                <Input
                    type="text"
                    fullWidth
                    value={inviteLink}
                    onChange={handleLink}
                />
                {error && (
                    <Typography variant="plain" color="danger" level="body-sm">
                        {error}
                    </Typography>
                )}
            </Stack>
            <Stack direction="column" mt={5}>
                <Typography>Invites should look like:</Typography>
                <Typography textColor="muted">fJ2XlEuD</Typography> or{" "}
                <Typography textColor="muted">{exampleLink}</Typography>
            </Stack>
            <Stack
                pt={{ xs: 6, sm: 8, md: 10 }}
                direction="row"
                justifyContent="space-between"
                width="100%"
                alignItems="flex-end"
            >
                <ButtonGroup fullWidth spacing={{ xs: 2, sm: 5 }}>
                    <Button
                        disabled={
                            isGettingInvite ||
                            isJoining ||
                            inviteLink.trim() === "" ||
                            !!error
                        }
                        onClick={() => handleJoin()}
                        variant="solid"
                        color="success"
                    >
                        Join Space
                    </Button>
                </ButtonGroup>
            </Stack>
            <Stack mt={2.5} alignItems="center" spacing={2}>
                <Typography>You prefer to create your own space?</Typography>
                <Link
                    variant="plain"
                    color="success"
                    onClick={() => setCreating(true)}
                    underline="always"
                    disabled={isGettingInvite || isJoining}
                >
                    Back to creating
                </Link>
            </Stack>
        </AnimatedPaper>
    );
});
