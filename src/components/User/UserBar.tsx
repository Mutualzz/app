import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    type PaperProps,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import {
    FaCogs,
    FaMicrophone,
    FaMicrophoneSlash,
    FaPalette,
} from "react-icons/fa";
import { IconButton } from "@components/IconButton";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context.tsx";
import { formatColor } from "@mutualzz/ui-core";
import { MdHeadset, MdHeadsetOff } from "react-icons/md";
import { ImPhoneHangUp } from "react-icons/im";
import { motion } from "motion/react";

const AnimatedPhoneHangUp = motion.create(ImPhoneHangUp);

// NOTE: Instead of using hovered, you should use the Animated motion stuff, fix it.
export const UserBar = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const { openContextMenu } = useMenu();
    const [hovered, setHovered] = useState(false);

    const inSpace = Boolean(app.spaces.activeId) && app.mode === "spaces";

    const conditionalProps = useMemo<Omit<PaperProps, "color">>(() => {
        if (inSpace)
            return {
                minWidth: "12rem",
                maxWidth: "20rem",
                direction: "row",
            };

        return {
            maxWidth: "4.25rem",
            minWidth: "4.25rem",
            minHeight: "20rem",
            maxHeight: "20rem",
            direction: "column",
        };
    }, [inSpace]);

    const account = app.account;
    if (!account) return <></>;

    const voiceChannel = app.voice.channel;

    const voiceStatus = app.voice.connectionStatus;
    const voiceError = app.voice.connectionError; //

    const showVoicePill =
        Boolean(voiceChannel) ||
        voiceStatus === "signaling" ||
        voiceStatus === "connecting" ||
        voiceStatus === "reconnecting" ||
        voiceStatus === "failed";

    const voiceTitle = useMemo(() => {
        switch (voiceStatus) {
            case "signaling":
                return "Connecting";
            case "connecting":
                return "RTC Connecting";
            case "connected":
                return "Voice Connected";
            case "reconnecting":
                return "Reconnecting";
            case "failed":
                return "Connection Failed";
            case "idle":
            default:
                return "Voice";
        }
    }, [voiceStatus]);

    const voiceTitleColor = useMemo(() => {
        switch (voiceStatus) {
            case "connected":
                return "success";
            case "failed":
                return "danger";
            case "reconnecting":
            case "connecting":
            case "signaling":
                return "warning";
            default:
                return "neutral";
        }
    }, [voiceStatus]);

    const voiceSubtitle = useMemo(() => {
        if (voiceChannel)
            return `${voiceChannel.name} / ${voiceChannel.space?.name ?? ""}`.trim();

        if (voiceStatus === "failed") return voiceError ?? "Unable to connect";
        if (voiceStatus === "reconnecting")
            return "Attempting to restore connection…";
        if (voiceStatus === "connecting") return "Setting up voice transports…";
        if (voiceStatus === "signaling") return "Requesting voice server…";
        if (voiceStatus === "idle") return "Not connected to voice";

        return "";
    }, [voiceChannel, voiceStatus, voiceError]);

    const canHangup =
        Boolean(app.voice.currentSpaceId) &&
        Boolean(app.voice.currentChannelId);

    return (
        <Stack
            mb={2}
            ml={1.5}
            position="absolute"
            bottom={0}
            width="95%"
            direction="column"
        >
            {showVoicePill && (
                <Paper
                    borderTopRightRadius={15}
                    borderTopLeftRadius={15}
                    elevation={app.settings?.preferEmbossed ? 5 : 1}
                    justifyContent="space-between"
                    color="neutral"
                    width="100%"
                    alignItems="center"
                    p={2.5}
                    zIndex={theme.zIndex.appBar + 1}
                >
                    <Stack spacing={1.25} direction="column">
                        <Typography
                            variant="plain"
                            color={voiceTitleColor}
                            level="body-sm"
                        >
                            {voiceTitle}
                        </Typography>

                        {voiceSubtitle && (
                            <Typography
                                level="body-xs"
                                textColor="secondary"
                                fontFamily="monospace"
                                css={{
                                    maxWidth: "17rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                                title={voiceSubtitle}
                            >
                                {voiceSubtitle}
                            </Typography>
                        )}
                    </Stack>

                    <Tooltip
                        title={
                            <TooltipWrapper>
                                {voiceStatus === "failed"
                                    ? "Leave"
                                    : voiceStatus === "connected"
                                      ? "Disconnect"
                                      : "Cancel"}
                            </TooltipWrapper>
                        }
                        placement="top"
                    >
                        <IconButton
                            disabled={!canHangup}
                            onClick={() => app.voice.leave()}
                        >
                            {/** TODO: Wiggle it when hovering */}
                            <AnimatedPhoneHangUp initial={{ rotate: 0 }} />
                        </IconButton>
                    </Tooltip>
                </Paper>
            )}

            <Paper
                justifyContent="space-between"
                alignItems="center"
                p={2.5}
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                color="neutral"
                borderTop={showVoicePill ? "0 !important" : undefined}
                width="100%"
                zIndex={theme.zIndex.appBar + 1}
                {...(showVoicePill
                    ? {
                          borderBottomRightRadius: 15,
                          borderBottomLeftRadius: 15,
                      }
                    : { borderRadius: 15 })}
                {...conditionalProps}
            >
                <Paper
                    direction={inSpace ? "row" : "column"}
                    alignItems="center"
                    spacing={2.5}
                    width="75%"
                    px={1}
                    py={0.25}
                    borderRadius={6}
                    variant={hovered ? "soft" : "plain"}
                    color={formatColor(theme.colors.neutral, { alpha: 90 })}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={(event) => {
                        const rect =
                            event.currentTarget.getBoundingClientRect();

                        openContextMenu(
                            event,
                            {
                                id: generateMenuIDs.user(account.id),
                                type: "account",
                                account,
                            },
                            {
                                x: Math.round(rect.left),
                                y: Math.round(rect.bottom - 125),
                            },
                        );
                    }}
                    css={{
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "background-color 0.2s",
                    }}
                >
                    <UserAvatar user={account} size={48} badge />
                    <Stack direction="column">
                        <Typography level="body-sm">
                            {account.displayName}
                        </Typography>
                        {account.globalName && (
                            <Typography level="body-xs" textColor="muted">
                                {account.username}
                            </Typography>
                        )}
                    </Stack>
                </Paper>

                <Stack spacing={1.25} direction="column">
                    <Tooltip
                        title={<TooltipWrapper>Mute</TooltipWrapper>}
                        placement="right"
                    >
                        <IconButton
                            variant="plain"
                            onClick={() =>
                                app.voice.setMute(!app.voice.preferredSelfMute)
                            }
                        >
                            {app.voice.selfMute ? (
                                <FaMicrophoneSlash
                                    color={theme.colors.danger}
                                />
                            ) : (
                                <FaMicrophone />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        title={<TooltipWrapper>Deafen</TooltipWrapper>}
                        placement="right"
                    >
                        <IconButton
                            variant="plain"
                            onClick={() =>
                                app.voice.setDeaf(!app.voice.preferredSelfDeaf)
                            }
                        >
                            {app.voice.selfDeaf ? (
                                <MdHeadsetOff color={theme.colors.danger} />
                            ) : (
                                <MdHeadset />
                            )}
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={1.25}
                >
                    <Tooltip
                        title={<TooltipWrapper>Appearance</TooltipWrapper>}
                        placement="right"
                    >
                        <IconButton
                            size="sm"
                            variant="plain"
                            onClick={() =>
                                openModal(
                                    "user-settings",
                                    <UserSettingsModal redirectTo="appearance" />,
                                )
                            }
                        >
                            <FaPalette />
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        placement="right"
                        title={<TooltipWrapper>Settings</TooltipWrapper>}
                    >
                        <IconButton
                            size="sm"
                            onClick={() =>
                                openModal(
                                    "user-settings",
                                    <UserSettingsModal />,
                                )
                            }
                            variant="plain"
                        >
                            <FaCogs />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>
        </Stack>
    );
});
