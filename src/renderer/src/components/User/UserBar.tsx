import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { type PaperProps, Stack, Tooltip, Typography, useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { FaCog, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IconButton } from "@components/IconButton";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context";
import { formatColor } from "@mutualzz/ui-core";
import { MdHeadset, MdHeadsetOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { ImPhoneHangUp } from "react-icons/im";
import { AnimatedIconButton } from "@components/Animated/AnimatedIconButton";
import { SmallActivityStatus } from "@components/SmallActivityStatus";
import { SpaceModerated } from "@components/Modals/SpaceModerated";

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
        voiceStatus === "connecting" ||
        voiceStatus === "failed";

    const inSpace = Boolean(app.spaces.activeId) && app.mode === "spaces";

    const conditionalProps = useMemo<Omit<PaperProps, "color">>(() => {
        if (inSpace)
            return {
                minWidth: "10rem",
                direction: "row"
            };

        return {
            width: "4.25rem",
            height: showVoicePill ? "25rem" : "17.5rem",
            direction: "column"
        };
    }, [inSpace, showVoicePill]);

    const account = app.account;

    const voiceTitle = useMemo(() => {
        switch (voiceStatus) {
            case "connecting":
                return "RTC Connecting";
            case "connected":
                return "Voice Connected";
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
            case "connecting":
                return "warning";
            default:
                return "neutral";
        }
    }, [voiceStatus]);

    const voiceSubtitle = useMemo(() => {
        if (voiceChannel)
            return `${voiceChannel.name} / ${voiceChannel.space?.name ?? ""}`.trim();

        if (voiceStatus === "failed") return voiceError ?? "Unable to connect";

        return "Attempting to restore connection…";
    }, [voiceChannel, voiceStatus, voiceError]);

    const canHangup =
        Boolean(app.voice.currentSpaceId) &&
        Boolean(app.voice.currentChannelId);

    const cameraEnabled = app.voice.cameraEnabled;

    if (!account) return null;

    return (
        <Stack
            mb={2}
            ml={1}
            position="absolute"
            bottom={0}
            width="97.5%"
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
                                        whiteSpace: "nowrap"
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
                                {cameraEnabled
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
                                onClick={() => app.voice.toggleCamera()}
                                css={{
                                    flex: 1
                                }}
                            >
                                {cameraEnabled ? (
                                    <MdVideocam color={theme.colors.success} />
                                ) : (
                                    <MdVideocamOff />
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
                spacing={1.25}
                {...(showVoicePill && inSpace
                    ? {
                          borderBottomRightRadius: 15,
                          borderBottomLeftRadius: 15
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
                                account
                            },
                            {
                                x: inSpace
                                    ? Math.round(rect.left)
                                    : Math.round(rect.left + 55),
                                y: inSpace
                                    ? Math.round(rect.bottom - 120)
                                    : Math.round(rect.top + 10)
                            }
                        );
                    }}
                    css={{
                        cursor: "pointer",
                        userSelect: "none",
                        transition: "background-color 0.2s"
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
                            placement="right"
                            title={
                                <TooltipWrapper>
                                    {cameraEnabled
                                        ? "Turn off camera"
                                        : "Turn on camera"}
                                </TooltipWrapper>
                            }
                        >
                            <IconButton
                                variant="plain"
                                onClick={() => app.voice.toggleCamera()}
                            >
                                {cameraEnabled ? (
                                    <MdVideocam color={theme.colors.success} />
                                ) : (
                                    <MdVideocamOff
                                        color={theme.colors.neutral}
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
                                        rotate: 0
                                    }}
                                    transition={{
                                        duration: -2.5,
                                        ease: "easeOut"
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
                    alignItems="center"
                    direction={inSpace ? "row" : "column"}
                    spacing={inSpace ? 2.5 : undefined}
                    mr={inSpace ? 1.25 : undefined}
                >
                    <Tooltip
                        placement={inSpace ? "top" : "right"}
                        title={<TooltipWrapper>Mute</TooltipWrapper>}
                    >
                        <IconButton
                            variant="plain"
                            onClick={() => {
                                if (app.voice.spaceMute) {
                                    openModal(
                                        "space-muted",
                                        <SpaceModerated type="muted" />
                                    );
                                    return;
                                }

                                app.voice.setMute(
                                    !app.settings?.preferredSelfMute
                                );
                            }}
                            size="sm"
                        >
                            {app.voice.effectiveSelfMute ? (
                                <FaMicrophoneSlash
                                    color={
                                        app.voice.spaceMute
                                            ? theme.colors.danger
                                            : undefined
                                    }
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
                            onClick={() => {
                                if (app.voice.spaceDeaf) {
                                    openModal(
                                        "space-deafened",
                                        <SpaceModerated type="deafened" />
                                    );
                                    return;
                                }
                                app.voice.setDeaf(
                                    !app.settings?.preferredSelfDeaf
                                );
                            }}
                            size="sm"
                        >
                            {app.voice.effectiveSelfDeaf ? (
                                <MdHeadsetOff
                                    color={
                                        app.voice.spaceDeaf
                                            ? theme.colors.danger
                                            : undefined
                                    }
                                />
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
                            onClick={() =>
                                openModal(
                                    "user-settings",
                                    <UserSettingsModal />
                                )
                            }
                            variant="plain"
                            size="sm"
                        >
                            <FaCog />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>
        </Stack>
    );
});
