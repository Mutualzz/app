import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    IconButton,
    type PaperProps,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { FaCogs, FaPalette } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

export const UserBar = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const { openModal } = useModal();

    const conditionalProps = useMemo<Omit<PaperProps, "color">>(() => {
        if (app.channels.activeId)
            return {
                minWidth: "12rem",
                maxWidth: "20rem",
                direction: "row",
            };

        return {
            maxWidth: "4.25rem",
            minWidth: "4.25rem",
            minHeight: "14rem",
            maxHeight: "20rem",
            direction: "column",
        };
    }, [app.spaces.activeId]);

    if (!app.account) return <></>;

    return (
        <Paper
            justifyContent="space-between"
            alignItems="center"
            p={2.5}
            position="absolute"
            bottom={0}
            width="95%"
            mb={2}
            ml={1.5}
            elevation={app.preferEmbossed ? 5 : 1}
            color="neutral"
            borderRadius={15}
            zIndex={theme.zIndex.appBar + 1}
            {...conditionalProps}
        >
            <Stack
                direction={app.spaces.activeId ? "row" : "column"}
                justifyContent="center"
                alignItems="center"
                spacing={2.5}
            >
                <UserAvatar user={app.account} size="lg" />
                <Stack direction="column">
                    <Typography level="body-sm">
                        {app.account.displayName}
                    </Typography>
                    {app.account.globalName && (
                        <Typography level="body-xs" textColor="muted">
                            {app.account.username}
                        </Typography>
                    )}
                </Stack>
            </Stack>
            <Stack
                justifyContent="center"
                alignItems="center"
                direction={app.spaces.activeId ? "row" : "column"}
                spacing={1.25}
            >
                <Stack direction="row">
                    <Tooltip
                        title={<TooltipWrapper>Appearance</TooltipWrapper>}
                    >
                        <IconButton
                            size="sm"
                            color="neutral"
                            variant="plain"
                            onClick={() =>
                                openModal(
                                    "theme-picker",
                                    <UserSettingsModal redirectTo="appearance" />,
                                    { showCloseButton: false },
                                )
                            }
                        >
                            <FaPalette />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack direction="column">
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
                                    { showCloseButton: false },
                                )
                            }
                            color="neutral"
                            variant="plain"
                        >
                            <FaCogs />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        placement="right"
                        title={<TooltipWrapper>Log out</TooltipWrapper>}
                    >
                        <IconButton
                            size="sm"
                            onClick={() => {
                                app.logout();
                            }}
                            color="neutral"
                            variant="plain"
                        >
                            <MdLogout />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Paper>
    );
});
