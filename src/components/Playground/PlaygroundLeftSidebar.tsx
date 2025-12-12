import { AnimatedPaper } from "@components/Animated/AnimatedPaper";
import { Button, Divider, Drawer, Stack, useTheme } from "@mutualzz/ui-web";
import { useMediaQuery } from "@react-hookz/web";
import { useLocation, useNavigate } from "@tanstack/react-router";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { useState } from "react";

const links = {
    dataDisplay: [
        {
            name: "Avatar",
            link: "/ui/data-display/avatar",
        },
        {
            name: "Divider",
            link: "/ui/data-display/divider",
        },
        {
            name: "List",
            link: "/ui/data-display/list",
        },
        {
            name: "Markdown",
            link: "/ui/data-display/markdown-renderer",
        },
        {
            name: "Typography",
            link: "/ui/data-display/typography",
        },
    ],
    feedback: [
        {
            name: "Circular Progress",
            link: "/ui/feedback/circular-progress",
        },
        {
            name: "Linear Progress",
            link: "/ui/feedback/linear-progress",
        },
    ],
    inputs: [
        {
            name: "Button",
            link: "/ui/inputs/button",
        },

        {
            name: "Checkbox",
            link: "/ui/inputs/checkbox",
        },
        {
            name: "Input",
            link: "/ui/inputs/input",
        },
        {
            name: "Input Groups",
            link: "/ui/inputs/input-groups",
        },
        {
            name: "Markdown",
            link: "/ui/inputs/markdown-input",
        },
        {
            name: "Radio Button",
            link: "/ui/inputs/radio-button",
        },
        {
            name: "Select",
            link: "/ui/inputs/select",
        },
        {
            name: "Slider",
            link: "/ui/inputs/slider",
        },
        {
            name: "Textarea",
            link: "/ui/inputs/textarea",
        },
    ],
    surfaces: [
        {
            name: "Paper",
            link: "/ui/surfaces/paper",
        },
    ],
};

export const PlaygroundLeftSidebar = observer(() => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const { pathname } = useLocation();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const SidebarContent = () => (
        <Stack
            spacing={6.25}
            direction="column"
            overflowY="auto"
            minWidth="14rem"
            p={5}
        >
            {Object.entries(links).map(([key, value]) => (
                <Stack
                    key={key}
                    justifyContent="center"
                    direction="column"
                    spacing={2.5}
                >
                    <Divider>{startCase(key)}</Divider>
                    <Stack direction="column" spacing={2.5}>
                        {value.map((button, i) => (
                            <Button
                                key={i}
                                variant="solid"
                                color="primary"
                                onClick={() => {
                                    if (pathname === button.link) return;
                                    navigate({
                                        to: button.link,
                                    });
                                }}
                                disabled={pathname === button.link}
                                size="lg"
                            >
                                {button.name}
                            </Button>
                        ))}
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );

    return (
        <>
            {isMobileQuery && (
                <Drawer
                    open={drawerOpen}
                    onOpen={() => setDrawerOpen(true)}
                    onClose={() => setDrawerOpen(false)}
                    anchor="left"
                    swipeable
                    size="sm"
                >
                    <SidebarContent />
                </Drawer>
            )}
            <AnimatedPaper
                initial={false}
                animate={{
                    x: isMobileQuery ? -230 : 0,
                    opacity: isMobileQuery ? 0 : 1,
                    pointerEvents: isMobileQuery ? "none" : "auto",
                    display: isMobileQuery ? "none" : "flex",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                zIndex={10}
                elevation={2}
                position="relative"
                aria-hidden={isMobileQuery}
            >
                <SidebarContent />
            </AnimatedPaper>
        </>
    );
});
