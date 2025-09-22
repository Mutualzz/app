import { useAppStore } from "@hooks/useStores";
import { useTheme, type ThemeMode } from "@mutualzz/ui";
import {
    Button,
    Divider,
    Drawer,
    Option,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
} from "@mutualzz/ui/web";
import { useMediaQuery } from "@react-hookz/web";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { sortThemes } from "@utils/index";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { motion } from "motion/react";
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

const AnimatedPaper = motion.create(Paper);

export const PlaygroundLeftSidebar = observer(() => {
    const navigate = useNavigate();
    const { theme: themeStore } = useAppStore();
    const [style, setStyle] = useState<"normal" | "gradient">("normal");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { mode, theme, changeTheme, changeMode } = useTheme();
    const { pathname } = useLocation();
    const isMobileQuery = useMediaQuery(
        theme.breakpoints.down("md").replace("@media ", ""),
    );

    const themes = Array.from(themeStore.themes.values())
        .filter((theme) => theme.type === mode)
        .filter((theme) => theme.mode === style);

    const handleThemeChange = (themeId: string) => {
        const changeTo = themes.find((theme) => theme.id === themeId);
        if (!changeTo) return;

        changeTheme(changeTo);
    };

    const SidebarContent = () => (
        <Stack
            spacing={25}
            direction="column"
            overflowY="auto"
            minWidth="14rem"
            p={20}
            css={{
                borderTopLeftRadius: "2rem",
                borderBottomLeftRadius: "2rem",
            }}
        >
            <Stack
                justifyContent="center"
                alignItems="center"
                direction="column"
                spacing={10}
            >
                <Divider>Color Type</Divider>
                <RadioGroup
                    variant="solid"
                    orientation="horizontal"
                    spacing={10}
                    value={mode}
                    onChange={(_, modeToSet) =>
                        changeMode(modeToSet as ThemeMode)
                    }
                    size="sm"
                >
                    <Radio label="Dark" value="dark" />
                    <Radio label="Light" value="light" />
                    <Radio label="System" value="system" />
                </RadioGroup>
            </Stack>
            {mode !== "system" && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Mode</Divider>
                    <RadioGroup
                        variant="solid"
                        onChange={(_, styleToSet) => {
                            setStyle(styleToSet as "normal" | "gradient");
                        }}
                        orientation="horizontal"
                        spacing={10}
                        value={style}
                    >
                        <Radio label="Normal" value="normal" />
                        <Radio label="Gradient" value="gradient" />
                    </RadioGroup>
                </Stack>
            )}
            {themes.length > 1 && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Scheme</Divider>
                    <Select
                        variant="solid"
                        onValueChange={(value) =>
                            handleThemeChange(value.toString())
                        }
                        value={theme.id}
                    >
                        {sortThemes(themes).map((theme) => (
                            <Option key={theme.id} value={theme.id}>
                                {theme.name}
                                {theme.createdBy ? ` (by You)` : ""}
                            </Option>
                        ))}
                    </Select>
                </Stack>
            )}
            {Object.entries(links).map(([key, value]) => (
                <Stack
                    key={key}
                    justifyContent="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>{startCase(key)}</Divider>
                    <Stack direction="column" spacing={10}>
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
                css={{
                    borderRight: `1px solid ${theme.colors.primary}`,
                    position: "relative",
                    zIndex: 10,
                }}
                aria-hidden={isMobileQuery}
            >
                <SidebarContent />
            </AnimatedPaper>
        </>
    );
});
