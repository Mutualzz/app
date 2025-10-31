import {
    useUserSidebar,
    type UserSidebarPage,
} from "@contexts/UserSidebar.context";
import { useAppStore } from "@hooks/useStores";
import { Button, ButtonGroup, Divider, Paper, Stack } from "@mutualzz/ui-web";
import { observer } from "mobx-react";
import { UserAvatar } from "./UserAvatar";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

export const UserSettingsSidebar = observer(
    ({ drawerOpen, setDrawerOpen }: UserSettingsSidebarProps) => {
        const app = useAppStore();

        const { account } = app;

        const { currentPage, setCurrentPage } = useUserSidebar();

        const handlePageSwitch = (page: UserSidebarPage) => {
            setCurrentPage(page);
            if (drawerOpen && setDrawerOpen) {
                setDrawerOpen(false);
            }
        };

        if (!account) return null;

        return (
            <Paper
                p="1rem"
                direction="column"
                width="100%"
                height="100%"
                elevation={2}
            >
                <Stack direction="column" spacing={10}>
                    <Button
                        startDecorator={<UserAvatar user={account} />}
                        variant="plain"
                        horizontalAlign="left"
                        color="neutral"
                        onClick={() => handlePageSwitch("profile")}
                    >
                        Profiles
                    </Button>
                    <Divider lineColor="primary" />
                    <Stack direction="column" spacing={1}>
                        <ButtonGroup
                            color="neutral"
                            size={{ xs: "sm", sm: "md" }}
                            orientation="vertical"
                            variant="plain"
                            spacing={5}
                        >
                            <Button
                                onClick={() => handlePageSwitch("my-account")}
                                variant={
                                    currentPage === "my-account"
                                        ? "soft"
                                        : "plain"
                                }
                            >
                                My Account
                            </Button>
                            <Button
                                onClick={() => handlePageSwitch("profile")}
                                variant={
                                    currentPage === "profile" ? "soft" : "plain"
                                }
                            >
                                Profile
                            </Button>
                        </ButtonGroup>
                    </Stack>
                </Stack>
            </Paper>
        );
    },
);
