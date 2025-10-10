import { UserSidebarProvider } from "@contexts/UserSidebar.context";
import { Drawer, Paper, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react";
import { useState } from "react";
import { UserSettingsSidebar } from "./UserSettingsSidebar";
import { UserSidebarContent } from "./UserSidebarContent";

export const UserSettingsModal = observer(() => {
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <UserSidebarProvider>
            <Paper
                width="100%"
                height="100%"
                p={{ xs: "0.5rem", sm: "1.5rem", md: "2rem" }}
                borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
                overflow="auto"
                justifyContent="center"
                alignItems="center"
                nonTranslucent
            >
                {isMobileQuery ? (
                    <>
                        <Drawer
                            open={drawerOpen}
                            onOpen={() => setDrawerOpen(true)}
                            onClose={() => setDrawerOpen(false)}
                            anchor="left"
                            swipeable
                            size="sm"
                        >
                            <UserSettingsSidebar
                                drawerOpen={drawerOpen}
                                setDrawerOpen={setDrawerOpen}
                            />
                        </Drawer>
                        <Stack
                            width="100%"
                            height="100%"
                            p={{ xs: "1rem", sm: "2rem" }}
                            overflow="auto"
                        >
                            <UserSidebarContent />
                        </Stack>
                    </>
                ) : (
                    <>
                        <Stack
                            minWidth={220}
                            maxWidth={300}
                            height="100%"
                            p={{ xs: "1rem", sm: "2rem" }}
                        >
                            <UserSettingsSidebar />
                        </Stack>
                        <Stack
                            flex={1}
                            height="100%"
                            p={{ xs: "1rem", sm: "2rem" }}
                            overflow="auto"
                        >
                            <UserSidebarContent />
                        </Stack>
                    </>
                )}
            </Paper>
        </UserSidebarProvider>
    );
});
