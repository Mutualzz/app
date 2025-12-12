import { AnimatedStack } from "@components/Animated/AnimatedStack";
import { SpaceInviteToSpaceModal } from "@components/Space/SpaceInviteToSpaceModal.tsx";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context.tsx";
import type { Theme } from "@emotion/react";
import { useAppStore } from "@hooks/useStores";
import type { APIInvite } from "@mutualzz/types";
import { dynamicElevation, formatColor } from "@mutualzz/ui-core";
import {
    Button,
    ButtonGroup,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { Invite } from "@stores/objects/Invite";
import type { Space } from "@stores/objects/Space";
import { useMutation } from "@tanstack/react-query";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { isTauri } from "@utils/index";
import dayjs from "dayjs";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { FaClipboard, FaTrash } from "react-icons/fa";

interface Props {
    space: Space;
}

interface InviteItemProps {
    theme: Theme;
    invite: Invite;
    last: boolean;
    now: Date;
}

function pad(num: number) {
    return num.toString().padStart(2, "0");
}

const formatCountdown = (expiresAt: Date, now: Date) => {
    const diff = dayjs(expiresAt).diff(dayjs(now));
    if (diff <= 0) return "Expired";
    const dur = dayjs.duration(diff);
    const days = pad(dur.days());
    const hours = pad(dur.hours());
    const minutes = pad(dur.minutes());
    const seconds = pad(dur.seconds());
    return `${days}:${hours}:${minutes}:${seconds}`;
};

const InviteItem = observer(({ theme, invite, last, now }: InviteItemProps) => {
    const [hover, setHover] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyInviteLink = async () => {
        if (isTauri) await writeText(invite.url);
        else await navigator.clipboard.writeText(invite.url);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <AnimatedStack
                flex={1}
                direction="row"
                alignItems="center"
                spacing={2}
                p="1rem"
                whileHover={{
                    background: formatColor(
                        dynamicElevation(theme.colors.surface, 5),
                        {
                            alpha: 0.5,
                        },
                    ),
                }}
                onMouseOver={() => setHover(true)}
                onMouseOut={() => setHover(false)}
            >
                <Stack flex={1} direction="row" alignItems="center" spacing={2}>
                    {invite.inviter && (
                        <>
                            <UserAvatar user={invite.inviter} />
                            <Stack direction="column">
                                <Typography>
                                    {invite.inviter.displayName}
                                </Typography>
                                {invite.channel && (
                                    <Typography
                                        level="body-xs"
                                        textColor="muted"
                                    >
                                        #{invite.channel.name}
                                    </Typography>
                                )}
                            </Stack>
                        </>
                    )}
                </Stack>
                <Stack direction="row" flex={1}>
                    <Typography fontFamily="monospace">
                        {invite.code}
                    </Typography>
                    <Tooltip
                        content={
                            <TooltipWrapper>
                                {copied
                                    ? "Copied to clipboard"
                                    : "Copy Invite URL"}
                            </TooltipWrapper>
                        }
                    >
                        <IconButton
                            variant="plain"
                            size="sm"
                            css={{
                                padding: 0,
                                marginLeft: "0.5rem",
                            }}
                            color="neutral"
                            onClick={copyInviteLink}
                        >
                            <FaClipboard />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Typography flex={1} fontFamily="monospace">
                    {invite.uses}
                    {invite.maxUses === 0 ? "" : ` / ${invite.maxUses}`}
                </Typography>
                <Stack
                    justifyContent="space-between"
                    flex={1}
                    fontFamily="monospace"
                >
                    <Typography fontFamily="monospace">
                        {invite.expiresAt ? (
                            <time dateTime={invite.expiresAt.toISOString()}>
                                {formatCountdown(invite.expiresAt, now)}
                            </time>
                        ) : (
                            "∞"
                        )}
                    </Typography>
                    {hover && (
                        <IconButton
                            onClick={() => invite.delete()}
                            color="danger"
                            size="sm"
                        >
                            <FaTrash />
                        </IconButton>
                    )}
                </Stack>
            </AnimatedStack>
            {!last && (
                <Divider
                    lineColor={formatColor(theme.typography.colors.muted, {
                        alpha: 35,
                        format: "hexa",
                    })}
                />
            )}
        </>
    );
});

// TODO: Eventually start using Tables instead of making Stack and stuff manually
export const SpaceInvitesSettings = observer(({ space }: Props) => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();

    const [invites, setInvites] = useState<Invite[]>([]);

    const { mutate: fetchInvites } = useMutation({
        mutationKey: ["space-invites", space.id],
        mutationFn: async () =>
            app.rest.get<APIInvite[]>(`/spaces/${space.id}/invites`),
        onSuccess: (data) => {
            const newInvites = data.map((inv) => space.addInvite(inv));
            setInvites(newInvites);
        },
    });

    useEffect(() => {
        fetchInvites();
    }, []);

    useEffect(() => {
        const dispose = reaction(
            () => space.invites.size,
            () => {
                setInvites(Array.from(space.invites.values()));
            },
        );

        return dispose;
    }, []);

    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Stack direction="column" spacing={4} pt={1}>
            <Stack alignItems="center" justifyContent="space-between">
                <Typography>Active Invite Links</Typography>
                <ButtonGroup spacing={10}>
                    <Button
                        onClick={() => space.deleteAll()}
                        color="danger"
                        variant="soft"
                        disabled={space.invites.size === 0}
                    >
                        Delete all invites
                    </Button>
                    <Button
                        onClick={() =>
                            openModal(
                                `invite-to-space-${space.id}`,
                                <SpaceInviteToSpaceModal />,
                            )
                        }
                    >
                        Create invite link
                    </Button>
                </ButtonGroup>
            </Stack>
            <Paper direction="column" variant="outlined">
                {invites.length > 0 && (
                    <Stack direction="column" spacing={2} pt={2}>
                        <Stack
                            flex={1}
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            px="1rem"
                        >
                            <Typography flex={1}>Inviter</Typography>
                            <Typography flex={1}>Invite Code</Typography>
                            <Typography flex={1}>Uses</Typography>
                            <Typography flex={1}>Expires</Typography>
                        </Stack>
                    </Stack>
                )}

                {invites.length === 0 && (
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        py="4rem"
                    >
                        <Typography textAlign="center" color="muted">
                            No invites have been created for this space yet.
                        </Typography>
                    </Stack>
                )}
                <Stack direction="column" justifyContent="center">
                    {invites.length > 0 &&
                        invites?.map((invite, i) => (
                            <InviteItem
                                theme={theme}
                                key={invite.code}
                                invite={invite}
                                last={i === invites.length - 1}
                                now={now}
                            />
                        ))}
                </Stack>
            </Paper>
        </Stack>
    );
});
