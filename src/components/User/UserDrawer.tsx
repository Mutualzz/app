import { Avatar } from "@components/Avatar";
import { useModal } from "@contexts/Modal.context";
import { useAppStore } from "@hooks/useStores";
import { Button, Divider, Drawer, Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react";
import { useState } from "react";
import { FaCogs, FaSignOutAlt } from "react-icons/fa";
import { UserSettingsModal } from "./UserSettingsModal";

export const UserDrawer = observer(
    ({ onlyAvatar = false }: { onlyAvatar?: boolean }) => {
        const app = useAppStore();
        const { account } = app;
        const [isOpen, setIsOpen] = useState(false);
        const { openModal } = useModal();

        return (
            <>
                <Avatar
                    size={onlyAvatar ? "md" : { xs: "md", sm: "lg" }}
                    onClick={() => setIsOpen(true)}
                />
                <Drawer
                    anchor="bottom"
                    open={isOpen}
                    onClose={() => setIsOpen(false)}
                    onOpen={() => setIsOpen(true)}
                    swipeable={false}
                    size={{ xs: "16rem", sm: "18rem" }}
                    css={{
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }}
                >
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
                                    src={account?.avatarUrl}
                                    alt="User Avatar"
                                />
                                <Stack direction="column">
                                    <Typography
                                        fontWeight={700}
                                        level={{ xs: "body-lg", sm: "h6" }}
                                    >
                                        {account?.globalName ??
                                            account?.username}
                                    </Typography>
                                    <Typography
                                        textColor="muted"
                                        level="body-sm"
                                        variant="plain"
                                    >
                                        @{account?.username}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Divider />
                            <Stack direction="column" spacing={1}>
                                <Button
                                    variant="plain"
                                    color="neutral"
                                    startDecorator={<FaCogs />}
                                    onClick={() => {
                                        setIsOpen(false);
                                        openModal(
                                            "user-settings",
                                            <UserSettingsModal />,
                                            { layout: "fullscreen" },
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
                                        setIsOpen(false);
                                        app.logout();
                                    }}
                                    size="md"
                                >
                                    Log Out
                                </Button>
                            </Stack>
                        </Stack>
                        <Button
                            variant="plain"
                            color="neutral"
                            onClick={() => setIsOpen(false)}
                            size={{ xs: "sm", sm: "md" }}
                        >
                            Close
                        </Button>
                    </Stack>
                </Drawer>
            </>
        );
    },
);
