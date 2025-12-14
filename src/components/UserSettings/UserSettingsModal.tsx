import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import {
    UserSettingsSidebarProvider,
    type UserSettingsSidebarPage,
} from "@contexts/UserSettingsSidebar.context";
import { useAppStore } from "@hooks/useStores";
import { Drawer, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react";
import { useState } from "react";
import { UserSettingsContent } from "./UserSettingsContent";
import { UserSettingsSidebar } from "./UserSettingsSidebar";

interface UserSettingsPropsModal {
    redirectTo?: UserSettingsSidebarPage;
}

export const UserSettingsModal = observer(
    ({ redirectTo }: UserSettingsPropsModal) => {
        const app = useAppStore();
        const { theme } = useTheme();
        const isMobileQuery = useMediaQuery(
            theme.breakpoints.down("md").replace("@media", ""),
        );

        const [drawerOpen, setDrawerOpen] = useState(false);

        return (
            <UserSettingsSidebarProvider>
                <AnimatedPaper
                    width="75vw"
                    height="82.5vh"
                    borderRadius={{
                        xs: "0.75rem",
                        sm: "1.25rem",
                        md: "1.5rem",
                    }}
                    overflow="auto"
                    justifyContent="center"
                    alignItems="center"
                    elevation={app.preferEmbossed ? 0 : 1}
                    transparency={0}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                >
                    {isMobileQuery ? (
                        <Stack maxWidth="1200px" width="100%" height="100%">
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
                            <UserSettingsContent redirectTo={redirectTo} />
                        </Stack>
                    ) : (
                        <Stack width="100%" height="100%">
                            <UserSettingsSidebar />
                            <UserSettingsContent redirectTo={redirectTo} />
                        </Stack>
                    )}
                </AnimatedPaper>
            </UserSettingsSidebarProvider>
        );
    },
);
