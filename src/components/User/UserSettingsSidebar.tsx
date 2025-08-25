import {
    useUserSidebar,
    type UserSidebarPage,
} from "@contexts/UserSidebar.context";
import {
    Button,
    ButtonGroup,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mutualzz/ui";
import { observer } from "mobx-react";

interface UserSettingsSidebarProps {
    drawerOpen?: boolean;
    setDrawerOpen?: (open: boolean) => void;
}

export const UserSettingsSidebar = observer(
    ({ drawerOpen, setDrawerOpen }: UserSettingsSidebarProps) => {
        const { currentPage, setCurrentPage } = useUserSidebar();

        const handlePageSwitch = (page: UserSidebarPage) => {
            setCurrentPage(page);
            if (drawerOpen && setDrawerOpen) {
                setDrawerOpen(false);
            }
        };

        return (
            <Paper
                p="1rem"
                direction="column"
                width="100%"
                height="100%"
                elevation={1}
            >
                <Stack direction="column">
                    <Typography
                        textAlign="center"
                        textColor="muted"
                        level="body-sm"
                    >
                        User Settings
                    </Typography>
                    <Divider />
                    <ButtonGroup
                        color="neutral"
                        size={{ xs: "sm", sm: "md" }}
                        orientation="vertical"
                        variant="plain"
                        spacing={5}
                    >
                        <Button
                            onClick={() => handlePageSwitch("profile")}
                            variant={
                                currentPage === "profile" ? "soft" : "plain"
                            }
                        >
                            Profile
                        </Button>
                        <Button
                            onClick={() => handlePageSwitch("my-account")}
                            variant={
                                currentPage === "my-account" ? "soft" : "plain"
                            }
                        >
                            My Account
                        </Button>
                    </ButtonGroup>
                </Stack>
            </Paper>
        );
    },
);
