import { Divider, Drawer, Paper, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { motion } from "motion/react";
import { useState, type PropsWithChildren } from "react";

const AnimatedPaper = motion.create(Paper);

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
            p={20}
            spacing={5}
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
                css={{
                    borderLeft: `1px solid ${theme.colors.primary}`,
                    position: "relative",
                    zIndex: 10,
                }}
                aria-hidden={isMobileQuery}
            >
                <SidebarContent />
            </AnimatedPaper>
        </>
    );
};
