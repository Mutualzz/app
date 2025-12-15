import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import {
    SpaceSettingsSidebarProvider,
    type SpaceSettingsSidebarPage,
} from "@contexts/SpaceSettingsSidebar.context";
import { useAppStore } from "@hooks/useStores";
import { Drawer, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import type { Space } from "@stores/objects/Space";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { SpaceSettingsContent } from "./SpaceSettingsContent";
import { SpaceSettingsSidebar } from "./SpaceSettingsSidebar";

interface SpaceSettingsPropsModal {
    space: Space;
    redirectTo?: SpaceSettingsSidebarPage;
}

export const SpaceSettingsModal = observer(
    ({ space, redirectTo }: SpaceSettingsPropsModal) => {
        const app = useAppStore();
        const { theme } = useTheme();

        const isMobileQuery = useMediaQuery(
            theme.breakpoints.down("md").replace("@media", ""),
        );

        const [drawerOpen, setDrawerOpen] = useState(false);

        return (
            <SpaceSettingsSidebarProvider>
                <AnimatedPaper
                    width="60vw"
                    height="75vh"
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
                                <SpaceSettingsSidebar
                                    space={space}
                                    drawerOpen={drawerOpen}
                                    setDrawerOpen={setDrawerOpen}
                                />
                            </Drawer>
                            <SpaceSettingsContent
                                space={space}
                                redirectTo={redirectTo}
                            />
                        </Stack>
                    ) : (
                        <Stack maxWidth="1200px" width="100%" height="100%">
                            <SpaceSettingsSidebar space={space} />
                            <SpaceSettingsContent
                                space={space}
                                redirectTo={redirectTo}
                            />
                        </Stack>
                    )}
                </AnimatedPaper>
            </SpaceSettingsSidebarProvider>
        );
    },
);
