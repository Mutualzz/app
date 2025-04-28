import { Divider } from "@ui/data-display/Divider/Divider";
import { useTheme } from "@ui/hooks/useTheme";
import { Button } from "@ui/inputs/Button/Button";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import type { ThemeMode } from "@ui/types";

import { themes as allThemes } from "@themes/index";

import { useNavigate } from "@tanstack/react-router";
import type { ButtonColor } from "@ui/inputs/Button/Button.types";
import { sortThemes } from "@ui/utils/sortThemes";

const colors = [
    "primary",
    "neutral",
    "success",
    "danger",
    "warning",
    "info",
] as ButtonColor[];

const randomColor = () =>
    colors[crypto.getRandomValues(new Uint32Array(1))[0] % colors.length];

export const PlaygrondLeftSidebar = () => {
    const { mode, changeMode, changeTheme } = useTheme();

    const navigate = useNavigate();

    const themes = allThemes.filter((theme) => theme.type === mode);

    const inputComponents = [
        {
            name: "Button",
            link: "/ui/button",
        },
        {
            name: "Checkbox",
            link: "/ui/checkbox",
        },
    ];

    const feedbackComponents = [
        {
            name: "Circular Progress",
            link: "/ui/circular-progress",
        },
        {
            name: "Linear Progress",
            link: "/ui/linear-progress",
        },
    ];

    const surfaceComponents = [
        {
            name: "Paper",
            link: "/ui/paper",
        },
    ];

    const dataDisplayComponents = [
        {
            name: "Divider",
            link: "/ui/divider",
        },
    ];

    return (
        <Paper
            css={{
                height: "100%",
                width: 300,
                justifyContent: "center",
                padding: 20,
            }}
        >
            <Stack direction="column" spacing={20}>
                <Stack direction="column" spacing={10}>
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
                            style={{
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
                                style={{
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
                <Divider>Input</Divider>
                <Stack direction="column" spacing={10}>
                    {inputComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color={randomColor()}
                            size="lg"
                            onClick={() => {
                                navigate({
                                    to: button.link,
                                });
                            }}
                        >
                            {button.name}
                        </Button>
                    ))}
                </Stack>
                <Divider>Feedback</Divider>
                <Stack direction="column" spacing={10}>
                    {feedbackComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color={randomColor()}
                            size="lg"
                            onClick={() => {
                                navigate({
                                    to: button.link,
                                });
                            }}
                        >
                            {button.name}
                        </Button>
                    ))}
                </Stack>
                <Divider>Data Display</Divider>
                <Stack direction="column" spacing={10}>
                    {dataDisplayComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color={randomColor()}
                            size="lg"
                            onClick={() => {
                                navigate({
                                    to: button.link,
                                });
                            }}
                        >
                            {button.name}
                        </Button>
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
};
