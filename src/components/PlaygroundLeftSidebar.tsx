import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useTheme } from "@ui/hooks/useTheme";
import type { ThemeMode } from "@ui/types";

import { themes as allThemes } from "@themes/index";

import { useLocation, useNavigate } from "@tanstack/react-router";
import { sortThemes } from "@ui/utils/sortThemes";
import { startCase } from "lodash-es";

const links = {
    inputs: [
        {
            name: "Button",
            link: "/ui/input/button",
        },
        {
            name: "Button Group",
            link: "/ui/input/button-group",
        },
        {
            name: "Checkbox",
            link: "/ui/input/checkbox",
        },
        {
            name: "Input",
            link: "/ui/input/input",
        },
        {
            name: "Markdown",
            link: "/ui/input/markdown-input",
        },
        {
            name: "Radio Button",
            link: "/ui/input/radio-button",
        },
        {
            name: "Slider",
            link: "/ui/input/slider",
        },
        {
            name: "Textarea",
            link: "/ui/input/textarea",
        },
    ],
    dataDisplay: [
        {
            name: "Divider",
            link: "/ui/data-display/divider",
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
            link: "/ui/surface/paper",
        },
    ],
};

export const PlaygrondLeftSidebar = () => {
    const { mode, changeMode, changeTheme } = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const themes = allThemes.filter((theme) => theme.type === mode);

    return (
        <Paper
            spacing={25}
            direction="column"
            p={40}
            justifyContent="flex-start"
            height="100%"
            overflowY="auto"
        >
            <Stack direction="column" spacing={25}>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    spacing={10}
                >
                    <Divider>Color Mode</Divider>
                    <select
                        onChange={(e) => {
                            changeMode(e.target.value as ThemeMode);
                        }}
                        defaultValue="system"
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
                            onChange={(e) => {
                                changeTheme(e.target.value);
                            }}
                            css={{
                                width: "100%",
                                padding: 10,
                                borderRadius: 5,
                                border: "1px solid #ccc",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {sortThemes(themes).map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.name}
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
};
