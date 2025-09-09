import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import {
    Avatar,
    Button,
    Divider,
    Paper,
    Popover,
    Stack,
    Typography,
} from "@mutualzz/ui";
import { observer } from "mobx-react";
import { FaCogs, FaSignOutAlt } from "react-icons/fa";
import { UserSettingsModal } from "./UserSettingsModal";

export const UserDropdown = observer(() => {
    const app = useAppStore();
    const { account } = app;
    const { openModal } = useModal();

    if (!account) return null;

    return (
        <>
            <Popover
                trigger={
                    <Avatar
                        size={{ xs: "md", sm: "lg" }}
                        src={account.avatarUrl}
                        alt={account.username}
                        css={{
                            cursor: "pointer",
                        }}
                    />
                }
                closeOnInteract
            >
                <Paper minHeight={200} minWidth={100}>
                    <Stack
                        p={{ xs: "1.25rem", sm: "1.5rem" }}
                        width="100%"
                        height="100%"
                        direction="column"
                    >
                        <Stack
                            flex={1}
                            direction="column"
                            spacing={{ xs: 2, sm: 3 }}
                        >
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={5}
                            >
                                <Avatar
                                    size="lg"
                                    src={account.avatarUrl}
                                    alt="User Avatar"
                                />
                                <Stack direction="column">
                                    <Typography
                                        fontWeight={700}
                                        level={{ xs: "body-lg", sm: "h6" }}
                                    >
                                        {account.globalName ?? account.username}
                                    </Typography>
                                    <Typography
                                        textColor="muted"
                                        level="body-sm"
                                        variant="plain"
                                    >
                                        @{account.username}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Divider />
                            <Stack direction="column" spacing={5}>
                                <Button
                                    variant="plain"
                                    color="neutral"
                                    startDecorator={<FaCogs />}
                                    onClick={() => {
                                        openModal(
                                            "user-settings",
                                            <UserSettingsModal />,
                                            {
                                                layout: "fullscreen",
                                            },
                                        );
                                    }}
                                    size="md"
                                >
                                    Settings
                                </Button>
                                <Button
                                    variant="soft"
                                    color="danger"
                                    startDecorator={<FaSignOutAlt />}
                                    onClick={() => {
                                        app.logout();
                                    }}
                                    size="md"
                                >
                                    Log Out
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>
            </Popover>
        </>
    );
});
