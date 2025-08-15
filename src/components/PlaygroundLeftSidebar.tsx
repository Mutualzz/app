import { useAppStore } from "@hooks/useStores";
import {
    Button,
    Divider,
    Option,
    Paper,
    Select,
    Stack,
    useTheme,
    type ThemeMode,
} from "@mutualzz/ui";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { sortThemes } from "@utils/index";
import startCase from "lodash-es/startCase";
import { observer } from "mobx-react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

const links = {
    inputs: [
        {
            name: "Button",
            link: "/ui/inputs/button",
        },
        {
            name: "Button Group",
            link: "/ui/inputs/button-group",
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
    dataDisplay: [
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
    surfaces: [
        {
            name: "Paper",
            link: "/ui/surfaces/paper",
        },
    ],
};

const AnimatedLogo = motion.create(Logo);

export const PlaygrondLeftSidebar = observer(() => {
    const navigate = useNavigate();
    const { theme: themeStore } = useAppStore();
    const { mode, theme, changeTheme, changeMode } = useTheme();
    const { pathname } = useLocation();

    const themes = Array.from(themeStore.themes.values()).filter(
        (theme) => theme.type === mode,
    );

    const handleThemeChange = (themeId: string) => {
        const changeTo = themes.find((theme) => theme.id === themeId);
        if (!changeTo) return;

        changeTheme(changeTo);
    };

    return (
        <Paper
            spacing={25}
            direction="column"
            justifyContent="flex-start"
            overflowY="auto"
            width="14rem"
            borderRadius="2rem"
            p={20}
        >
            <AnimatedLogo
                css={{
                    width: 64,
                    height: 64,
                    alignSelf: "center",
                    cursor: "pointer",
                }}
                onClick={() => {
                    navigate({
                        to: "/",
                        replace: true,
                    });
                }}
                whileHover={{
                    scale: 1.1,
                }}
            />
            <Stack direction="column" spacing={25}>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Mode</Divider>
                    <Select
                        variant="solid"
                        onValueChange={(modeToSet) => {
                            changeMode(modeToSet as ThemeMode);
                        }}
                        value={mode}
                    >
                        <Option value="dark">Dark</Option>
                        <Option value="light">Light</Option>
                        <Option value="system">System</Option>
                    </Select>
                </Stack>
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
            </Stack>
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
        </Paper>
    );
});
