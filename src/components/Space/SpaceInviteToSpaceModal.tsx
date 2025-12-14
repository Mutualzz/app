import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Link } from "@components/Link";
import { useAppStore } from "@hooks/useStores";
import type { APIInvite } from "@mutualzz/types";
import { HttpException } from "@mutualzz/types";
import {
    Button,
    ButtonGroup,
    Input,
    Option,
    Select,
    Stack,
    Typography,
} from "@mutualzz/ui-web";
import type { Channel } from "@stores/objects/Channel";
import { Invite } from "@stores/objects/Invite";
import type { Space } from "@stores/objects/Space";
import { useMutation, useQuery } from "@tanstack/react-query";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { isTauri } from "@utils/index";
import dayjs from "dayjs";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FaCopy } from "react-icons/fa";

interface Props {
    channel?: Channel | null;
}

const expirations = [
    { label: "30 minutes", value: 1800 },
    { label: "1 hour", value: 3600 },
    { label: "6 hours", value: 21600 },
    { label: "12 hours", value: 43200 },
    { label: "1 day", value: 86400 },
    { label: "7 days", value: 604800 },
    { label: "Never", value: null },
];

const maxUses = [
    { label: "No limit", value: 0 },
    { label: "1 use", value: 1 },
    { label: "5 uses", value: 5 },
    { label: "10 uses", value: 10 },
    { label: "25 uses", value: 25 },
    { label: "50 uses", value: 50 },
    { label: "100 uses", value: 100 },
];

export const SpaceInviteToSpaceModal = observer(({ channel }: Props) => {
    const app = useAppStore();
    const [editing, setEditing] = useState(false);
    const [expiresAfter, setExpiresAfter] = useState(expirations[5].value);
    const [maxUsesAfter, setMaxUsesAfter] = useState(maxUses[0].value);
    const [invite, setInvite] = useState<Invite | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, isLoading, error } = useQuery<
        APIInvite | undefined,
        HttpException
    >({
        queryKey: ["createInvite", app.spaces.active?.id, channel?.id],
        queryFn: () => app.spaces.active?.createInvite(channel?.id),
        enabled: !!app.spaces.active,
        refetchOnWindowFocus: false,
        refetchInterval: 0,
        refetchIntervalInBackground: false,
    });

    const { mutate: updateInvite } = useMutation({
        mutationKey: ["updateInvite", app.spaces.active?.id, channel?.id],
        mutationFn: (space: Space) =>
            app.rest.patch<APIInvite>(
                `/spaces/${space.id}/invites/${invite?.code}`,
                {
                    maxUses: maxUsesAfter,
                    expiresAt: expiresAfter,
                },
            ),
        onSuccess: (invite) => {
            setEditing(false);
            setInvite(new Invite(app, invite));
        },
    });

    useEffect(() => {
        if (!isLoading && data) setInvite(new Invite(app, data));
    }, [data, isLoading]);

    const channelToUse = channel ?? app.spaces.active?.firstNavigableChannel;

    const inviteUrl = Invite.constructUrl(invite?.code || "");

    const copyInviteLink = async () => {
        if (isTauri) await writeText(inviteUrl);
        else await navigator.clipboard.writeText(inviteUrl);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatedPaper
            elevation={app.preferEmbossed ? 5 : 1}
            borderRadius={12}
            minWidth={{ xs: "90vw", sm: 340, md: 420, lg: 500 }}
            maxWidth={500}
            direction="column"
            transparency={65}
            minHeight={300}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            alignItems="center"
            justifyContent={editing ? "center" : "space-between"}
            spacing={0}
            px={{ xs: "0.75rem", sm: "1.5rem" }}
            py={{
                xs: "0.5rem",
                sm: "1rem",
            }}
        >
            {editing && (
                <>
                    <Stack
                        width="100%"
                        direction="column"
                        justifyContent="center"
                        mt={2.5}
                        spacing={1}
                        mb={4}
                    >
                        <Typography level="h5" fontWeight="bold">
                            Editing the current invite link
                        </Typography>
                    </Stack>
                    <Stack width="100%" direction="column" spacing={5} py={2}>
                        <Stack direction="column" spacing={1}>
                            <Typography level="body-sm">
                                Expire After
                            </Typography>
                            <Select
                                color="neutral"
                                value={expiresAfter as number}
                                onValueChange={(val) =>
                                    setExpiresAfter(
                                        val as unknown as number | null,
                                    )
                                }
                            >
                                {expirations.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Option>
                                ))}
                            </Select>
                        </Stack>
                        <Stack direction="column" spacing={1}>
                            <Typography level="body-sm">Max Uses</Typography>
                            <Select
                                onValueChange={(val) =>
                                    setMaxUsesAfter(val as number)
                                }
                                color="neutral"
                                value={maxUsesAfter}
                            >
                                {maxUses.map((opt) => (
                                    <Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Option>
                                ))}
                            </Select>
                        </Stack>
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <ButtonGroup spacing={10} fullWidth>
                                <Button
                                    onClick={() => setEditing(false)}
                                    variant="soft"
                                    color="neutral"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() =>
                                        updateInvite(app.spaces.active!)
                                    }
                                    variant="solid"
                                    color="success"
                                >
                                    Save
                                </Button>
                            </ButtonGroup>
                        </Stack>
                    </Stack>
                </>
            )}
            {!editing && (
                <>
                    <Stack
                        width="100%"
                        direction="column"
                        justifyContent="center"
                        spacing={1}
                    >
                        <Typography level="h5" fontWeight="bold">
                            Invite friends to{" "}
                            {app.spaces.active?.name || "Unknown Space"}
                        </Typography>
                        <Typography level="body-sm">
                            Recipients will land in #
                            {channelToUse?.name || "Unknown"}
                        </Typography>
                    </Stack>
                    <Stack direction="column" width="100%" spacing={1}>
                        <Typography level="body-sm">Invite Link</Typography>
                        <Input
                            type="text"
                            readOnly
                            value={error?.message || inviteUrl}
                            error={!!error}
                            fullWidth
                            endDecorator={
                                <Button
                                    padding={4}
                                    startDecorator={<FaCopy />}
                                    variant="soft"
                                    color={error ? "danger" : "neutral"}
                                    onClick={copyInviteLink}
                                    disabled={
                                        isLoading ||
                                        !!error ||
                                        !invite ||
                                        copied
                                    }
                                >
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            }
                        />
                        <Stack mt="0.5rem" justifyContent="space-between">
                            {!isLoading && !error && (
                                <>
                                    <Typography
                                        level="body-xs"
                                        textColor="muted"
                                    >
                                        This link will expire{" "}
                                        <Typography>
                                            {invite?.expiresAt ? (
                                                <time
                                                    dateTime={invite.expiresAt.toISOString()}
                                                >
                                                    {dayjs(
                                                        invite.expiresAt,
                                                    ).fromNow()}
                                                </time>
                                            ) : (
                                                "never"
                                            )}
                                        </Typography>
                                        {invite?.maxUses &&
                                        invite?.maxUses > 0 ? (
                                            <Typography
                                                level="body-xs"
                                                textColor="muted"
                                            >
                                                {" "}
                                                or after{" "}
                                                <Typography>
                                                    {invite?.maxUses} uses
                                                </Typography>
                                            </Typography>
                                        ) : null}
                                        .
                                    </Typography>
                                    <Link
                                        level="body-xs"
                                        onClick={() => setEditing(true)}
                                        disabled={
                                            isLoading || !!error || !invite
                                        }
                                        variant="plain"
                                        color="info"
                                        underline="always"
                                    >
                                        Edit invite link
                                    </Link>
                                </>
                            )}
                        </Stack>
                    </Stack>
                </>
            )}
        </AnimatedPaper>
    );
});
