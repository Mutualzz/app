import { SettingsModal } from "@components/Settings/SettingsModal";
import { ThemeCreator } from "@components/ThemeCreator";
import { ThemeSelector } from "@components/ThemeSelector";
import { UserAvatar } from "@components/User/UserAvatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    Button,
    IconButton,
    Paper,
    Popover,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import { observer } from "mobx-react";
import { useState } from "react";
import { FaCogs, FaPalette } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

export const UserBar = observer(() => {
    const app = useAppStore();
    const { openModal } = useModal();
    const { account } = app;

    const [isOpen, setIsOpen] = useState(false);

    if (!account) return <></>;

    return (
        <Paper
            elevation={3}
            minWidth="12rem"
            justifyContent="space-between"
            alignItems="center"
            direction="row"
            maxWidth="20rem"
            p={10}
        >
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={10}
            >
                <UserAvatar user={account} />
                <Stack direction="column">
                    <Typography level="body-sm">
                        {account.globalName ?? account.username}
                    </Typography>
                    {account.globalName && (
                        <Typography level="body-xs" textColor="muted">
                            {account.username}
                        </Typography>
                    )}
                </Stack>
            </Stack>
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="row"
                spacing={5}
            >
                <Stack direction="row">
                    <Popover
                        trigger={
                            <Tooltip title="Choose theme">
                                <IconButton
                                    size="sm"
                                    color="neutral"
                                    variant="plain"
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <FaPalette />
                                </IconButton>
                            </Tooltip>
                        }
                        isOpen={isOpen}
                    >
                        <Paper
                            spacing={10}
                            direction="column"
                            p={20}
                            elevation={5}
                        >
                            <ThemeSelector />
                            <Button
                                color="success"
                                onClick={() => {
                                    openModal(
                                        "theme-creator",
                                        <ThemeCreator />,
                                        {
                                            height: "100%",
                                        },
                                    );
                                    setIsOpen(false);
                                }}
                            >
                                Theme Editor
                            </Button>
                        </Paper>
                    </Popover>
                </Stack>
                <Stack direction="column">
                    <Tooltip placement="right" title="User Settings">
                        <IconButton
                            size="sm"
                            onClick={() =>
                                openModal("user-settings", <SettingsModal />, {
                                    height: "100%",
                                })
                            }
                            color="neutral"
                            variant="plain"
                        >
                            <FaCogs />
                        </IconButton>
                    </Tooltip>
                    <Tooltip placement="right" title="Logout">
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
