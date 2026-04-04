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
import { FaCogs, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IconButton } from "@components/IconButton";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context.tsx";
import { formatColor } from "@mutualzz/ui-core";
import {
    MdHeadset,
    MdHeadsetOff,
    MdVideocam,
    MdVideocamOff,
} from "react-icons/md";
import { ImPhoneHangUp } from "react-icons/im";
import { AnimatedIconButton } from "@components/Animated/AnimatedIconButton.tsx";
import { SmallActivityStatus } from "@components/SmallActivityStatus.tsx";

// NOTE: Instead of using hovered, you should use the Animated motion stuff, fix it.
export const UserBar = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();
    const { openContextMenu } = useMenu();
    const [hovered, setHovered] = useState(false);

    const voiceChannel = app.voice.channel;

    const voiceStatus = app.voice.connectionStatus;
    const voiceError = app.voice.connectionError;

    const showVoicePill =
        Boolean(voiceChannel) ||
        voiceStatus === "signaling" ||
        voiceStatus === "connecting" ||
        voiceStatus === "reconnecting" ||
        voiceStatus === "failed";

    const inSpace = Boolean(app.spaces.activeId) && app.mode === "spaces";

    const conditionalProps = useMemo<Omit<PaperProps, "color">>(() => {
        if (inSpace)
            return {
                minWidth: "12rem",
                direction: "row",
            };

        return {
            width: "4.25rem",
            height: showVoicePill ? "25rem" : "17.5rem",
            direction: "column",
        };
    }, [inSpace, showVoicePill]);

    const account = app.account;
    if (!account) return <></>;

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

    const hasCameras = app.voice.cameras.length > 0;
    const cameraEnabled = app.voice.cameraEnabled;

    return (
        <Stack
            mb={2}
            ml={1.5}
            position="absolute"
            bottom={0}
            width="95%"
            direction="column"
        >
            {showVoicePill && inSpace && (
                <Paper
                    borderTopRightRadius={15}
                    borderTopLeftRadius={15}
                    elevation={app.settings?.preferEmbossed ? 5 : 1}
                    color="neutral"
                    p={2.5}
                    zIndex={theme.zIndex.appBar + 1}
                    direction="column"
                    spacing={2.5}
                >
                    <Stack
                        width="100%"
                        alignItems="center"
                        justifyContent="space-between"
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
                            title={<TooltipWrapper>Disconnect</TooltipWrapper>}
                            placement="top"
                        >
                            <IconButton
                                disabled={!canHangup}
                                onClick={() => app.voice.leave()}
                            >
                                <ImPhoneHangUp />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <Tooltip
                        placement={inSpace ? "top" : "right"}
                        title={
                            <TooltipWrapper>
                                {!hasCameras
                                    ? "No camera available"
                                    : cameraEnabled
                                      ? "Disable camera"
                                      : "Enable camera"}
                            </TooltipWrapper>
                        }
                    >
                        <Stack
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <IconButton
                                variant="soft"
                                disabled={!hasCameras}
                                onClick={() => app.voice.toggleCamera()}
                                css={{
                                    flex: 1,
                                }}
                            >
                                {cameraEnabled ? (
                                    <MdVideocam color={theme.colors.success} />
                                ) : (
                                    <MdVideocamOff
                                        color={
                                            hasCameras
                                                ? undefined
                                                : theme.colors.neutral
                                        }
                                    />
                                )}
                            </IconButton>
                        </Stack>
                    </Tooltip>
                </Paper>
            )}

            <Paper
                justifyContent="space-between"
                alignItems="center"
                px={2.5}
                py={1.25}
                elevation={app.settings?.preferEmbossed ? 5 : 1}
                color="neutral"
                borderTop={showVoicePill ? "0 !important" : undefined}
                width="100%"
                zIndex={theme.zIndex.appBar + 1}
                {...(showVoicePill && inSpace
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
                    width={inSpace && showVoicePill ? "75%" : "100%"}
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
                                x: inSpace
                                    ? Math.round(rect.left)
                                    : Math.round(rect.left + 55),
                                y: inSpace
                                    ? Math.round(rect.bottom - 120)
                                    : Math.round(rect.top + 10),
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
                        <Typography
                            textAlign={!inSpace ? "center" : undefined}
                            level="body-sm"
                        >
                            {account.displayName}
                        </Typography>
                        {account.presence?.activities.length === 0 &&
                            account.globalName && (
                                <Typography level="body-xs" textColor="muted">
                                    {account.username}
                                </Typography>
                            )}
                        {account.presence && (
                            <SmallActivityStatus
                                vertical={!inSpace}
                                presence={account.presence}
                            />
                        )}
                    </Stack>
                </Paper>

                {!inSpace && showVoicePill && (
                    <Stack
                        direction="column"
                        spacing={1.25}
                        alignItems="center"
                    >
                        <Tooltip
                            title={
                                <TooltipWrapper>
                                    <Stack direction="column" spacing={0.5}>
                                        <Typography
                                            level="body-sm"
                                            color={voiceTitleColor}
                                        >
                                            {voiceTitle}
                                        </Typography>
                                        {voiceSubtitle && (
                                            <Typography
                                                level="body-xs"
                                                textColor="muted"
                                            >
                                                {voiceSubtitle}
                                            </Typography>
                                        )}
                                    </Stack>
                                </TooltipWrapper>
                            }
                            placement="right"
                        >
                            <IconButton variant="plain" color={voiceTitleColor}>
                                <MdHeadset />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            placement={inSpace ? "top" : "right"}
                            title={
                                <TooltipWrapper>
                                    {!hasCameras
                                        ? "No camera available"
                                        : cameraEnabled
                                          ? "Turn off camera"
                                          : "Turn on camera"}
                                </TooltipWrapper>
                            }
                        >
                            <IconButton
                                variant="plain"
                                disabled={!hasCameras}
                                onClick={() => app.voice.toggleCamera()}
                            >
                                {cameraEnabled ? (
                                    <MdVideocam color={theme.colors.success} />
                                ) : (
                                    <MdVideocamOff
                                        color={
                                            hasCameras
                                                ? undefined
                                                : theme.colors.neutral
                                        }
                                    />
                                )}
                            </IconButton>
                        </Tooltip>

                        {canHangup && (
                            <Tooltip
                                title={
                                    <TooltipWrapper>Disconnect</TooltipWrapper>
                                }
                                placement="right"
                            >
                                <AnimatedIconButton
                                    initial={{ rotate: 90 }}
                                    whileHover={{
                                        rotate: 0,
                                    }}
                                    transition={{
                                        duration: -2.5,
                                        ease: "easeOut",
                                    }}
                                    size="sm"
                                    onClick={() => app.voice.leave()}
                                >
                                    <ImPhoneHangUp />
                                </AnimatedIconButton>
                            </Tooltip>
                        )}
                    </Stack>
                )}

                <Stack
                    spacing={2.5}
                    alignItems="center"
                    direction={inSpace ? "row" : "column"}
                    ml={1.25}
                >
                    <Tooltip
                        placement={inSpace ? "top" : "right"}
                        title={<TooltipWrapper>Mute</TooltipWrapper>}
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
                        placement={inSpace ? "top" : "right"}
                        title={<TooltipWrapper>Deafen</TooltipWrapper>}
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

                    <Tooltip
                        placement={inSpace ? "top" : "right"}
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
