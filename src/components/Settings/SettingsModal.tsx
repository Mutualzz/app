import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import {
    SettingsSidebarProvider,
    type SettingsSidebarPage,
} from "@contexts/SettingsSidebar.context";
import { Drawer, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react";
import { useState } from "react";
import { SettingsContent } from "./SettingsContent";
import { UserSettingsSidebar } from "./SettingsSidebar";

interface SettingsPropsModal {
    redirectTo?: SettingsSidebarPage;
}

export const SettingsModal = observer(({ redirectTo }: SettingsPropsModal) => {
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <SettingsSidebarProvider>
            <AnimatedPaper
                width="60vw"
                height="100%"
                borderRadius={{ xs: "0.75rem", sm: "1.25rem", md: "1.5rem" }}
                overflow="auto"
                justifyContent="center"
                alignItems="center"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                nonTranslucent
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
                        <SettingsContent redirectTo={redirectTo} />
                    </Stack>
                ) : (
                    <Stack maxWidth="1200px" width="100%" height="100%">
                        <UserSettingsSidebar />
                        <SettingsContent redirectTo={redirectTo} />
                    </Stack>
                )}
            </AnimatedPaper>
        </SettingsSidebarProvider>
    );
});
