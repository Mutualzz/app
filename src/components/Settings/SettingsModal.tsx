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
                width="90vw"
                height="100%"
                p={{ xs: "0.5rem", sm: "1.5rem", md: "2rem" }}
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
                        <Stack
                            width="100%"
                            height="100%"
                            p={{ xs: "1rem", sm: "2rem" }}
                            overflow="auto"
                        >
                            <SettingsContent redirectTo={redirectTo} />
                        </Stack>
                    </Stack>
                ) : (
                    <Stack maxWidth="1200px" width="100%" height="100%">
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
                            <SettingsContent redirectTo={redirectTo} />
                        </Stack>
                    </Stack>
                )}
            </AnimatedPaper>
        </SettingsSidebarProvider>
    );
});
