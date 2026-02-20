import { Paper } from "@components/Paper";
import { TooltipWrapper } from "@components/TooltipWrapper";
import { UserAvatar } from "@components/User/UserAvatar";
import { UserSettingsModal } from "@components/UserSettings/UserSettingsModal";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { type PaperProps, Stack, Tooltip, Typography, useTheme, } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { FaCogs, FaPalette } from "react-icons/fa";
import { IconButton } from "@components/IconButton";
import { generateMenuIDs, useMenu } from "@contexts/ContextMenu.context.tsx";
import { formatColor } from "@mutualzz/ui-core";

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
            minHeight: "14rem",
            maxHeight: "20rem",
            direction: "column",
        };
    }, [inSpace]);

    const account = app.account;

    if (!account) return <></>;

    console.log(
        "Rendering UserBar with account:",
        hovered,
        formatColor(theme.colors.neutral, {
            alpha: 90,
        }),
    );

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
            elevation={app.settings?.preferEmbossed ? 5 : 1}
            color="neutral"
            borderRadius={15}
            zIndex={theme.zIndex.appBar + 1}
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
                color={formatColor(theme.colors.neutral, {
                    alpha: 90,
                })}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();

                    openContextMenu(
                        e,
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
            <Stack
                justifyContent="center"
                alignItems="center"
                direction={inSpace ? "row" : "column"}
                spacing={1.25}
            >
                <Stack direction="row">
                    <Tooltip
                        title={<TooltipWrapper>Appearance</TooltipWrapper>}
                        placement={inSpace ? "top" : "right"}
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
                                )
                            }
                            variant="plain"
                        >
                            <FaCogs />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
        </Paper>
    );
});
