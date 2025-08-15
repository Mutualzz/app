import { useAppStore } from "@hooks/useStores";
import {
    Button,
    Divider,
    Paper,
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

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const changeTo = themes.find((theme) => theme.id === e.target.value);
        if (!changeTo) {
            e.preventDefault();
            return;
        }

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
                    <select
                        onChange={(e) =>
                            changeMode(e.target.value as ThemeMode)
                        }
                        value={mode}
                        css={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 5,
                            border: "1px solid #ccc",
                            backgroundColor: "#f9f9f9",
                        }}
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                    </select>
                </Stack>
                {themes.length > 1 && (
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        direction="column"
                        spacing={10}
                    >
                        <Divider>Color Scheme</Divider>
                        <select
                            onChange={handleThemeChange}
                            css={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                            value={theme.id}
                        >
                            {sortThemes(themes).map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.name}
                                    {theme.createdBy ? ` (by You)` : ""}
                                </option>
                            ))}
                        </select>
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
