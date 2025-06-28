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
            link: "/ui/button",
        },
        {
            name: "Button Group",
            link: "/ui/button-group",
        },
        {
            name: "Checkbox",
            link: "/ui/checkbox",
        },
        {
            name: "Input",
            link: "/ui/input",
        },
        {
            name: "Radio Button",
            link: "/ui/radio-button",
        },
        {
            name: "Slider",
            link: "/ui/slider",
        },
        {
            name: "Textarea",
            link: "/ui/textarea",
        },
    ],
    dataDisplay: [
        {
            name: "Divider",
            link: "/ui/divider",
        },
        {
            name: "Typography",
            link: "/ui/typography",
        },
    ],
    feedback: [
        {
            name: "Circular Progress",
            link: "/ui/circular-progress",
        },
        {
            name: "Linear Progress",
            link: "/ui/linear-progress",
        },
    ],
    surfaces: [
        {
            name: "Paper",
            link: "/ui/paper",
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
                                color={
                                    pathname === button.link
                                        ? "success"
                                        : "primary"
                                }
                                onClick={() => {
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
