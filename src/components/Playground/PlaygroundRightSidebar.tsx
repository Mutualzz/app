import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Divider, Drawer, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useState, type PropsWithChildren } from "react";

export const PlaygroundRightSidebar = ({ children }: PropsWithChildren) => {
    const { theme } = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const SidebarContent = () => (
        <Stack
            overflowY="auto"
            direction="column"
            p={5}
            spacing={1.25}
            minWidth="20%"
        >
            <Divider>Playground</Divider>
            {children}
        </Stack>
    );

    return (
        <>
            {isMobileQuery && (
                <Drawer
                    open={drawerOpen}
                    onOpen={() => setDrawerOpen(true)}
                    onClose={() => setDrawerOpen(false)}
                    anchor="right"
                    swipeable
                    size="sm"
                >
                    <SidebarContent />
                </Drawer>
            )}
            <AnimatedPaper
                initial={false}
                animate={{
                    x: isMobileQuery ? 280 : 0,
                    opacity: isMobileQuery ? 0 : 1,
                    pointerEvents: isMobileQuery ? "none" : "auto",
                    display: isMobileQuery ? "none" : "flex",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                zIndex={10}
                position="relative"
                aria-hidden={isMobileQuery}
                elevation={2}
            >
                <SidebarContent />
            </AnimatedPaper>
        </>
    );
};
