import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import {
    type UserSettingsPage,
    UserSettingsProvider,
} from "@components/UserSettings/UserSettings.context.tsx";
import { useAppStore } from "@hooks/useStores";
import { Drawer, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { UserSettingsContent } from "./UserSettingsContent";
import { UserSettingsSidebar } from "./UserSettingsSidebar";

interface UserSettingsPropsModal {
    redirectTo?: UserSettingsPage;
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
            <UserSettingsProvider>
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
                    elevation={app.settings?.preferEmbossed ? 0 : 1}
                    transparency={0}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
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
                            <UserSettingsContent redirectTo={redirectTo} />
                        </>
                    ) : (
                        <>
                            <UserSettingsSidebar />
                            <UserSettingsContent redirectTo={redirectTo} />
                        </>
                    )}
                </AnimatedPaper>
            </UserSettingsProvider>
        );
    },
);
