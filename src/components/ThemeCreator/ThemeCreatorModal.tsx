import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { useAppStore } from "@hooks/useStores";
import { Drawer, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ThemeCreatorContent } from "./ThemeCreatorContent";
import { ThemeCreatorSidebarLeft } from "./ThemeCreatorSidebar.left";

// TODO: finish resetting values when modal is closed in certain circumstances, not when preview is stopped or started
// NOTE: Start at right sidebar first and try to utilize close modal there onClose stuff or something similar to that
export const ThemeCreatorModal = observer(() => {
    const app = useAppStore();
    const { theme } = useTheme();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media", ""),
    );

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <AnimatedPaper
            width="65vw"
            height="72.5vh"
            borderRadius={{
                xs: "0.75rem",
                sm: "1.25rem",
                md: "1.5rem",
            }}
            justifyContent="center"
            alignItems="center"
            elevation={app.preferEmbossed ? 0 : 1}
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
                        <ThemeCreatorSidebarLeft
                            drawerOpen={drawerOpen}
                            setDrawerOpen={setDrawerOpen}
                        />
                    </Drawer>
                    <ThemeCreatorContent />
                </>
            ) : (
                <>
                    <ThemeCreatorSidebarLeft />
                    <ThemeCreatorContent />
                </>
            )}
        </AnimatedPaper>
    );
});
