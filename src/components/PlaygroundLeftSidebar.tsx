import { Divider } from "@ui/components/data-display/Divider/Divider";
import { Button } from "@ui/components/inputs/Button/Button";
import { Stack } from "@ui/components/layout/Stack/Stack";
import { Paper } from "@ui/components/surfaces/Paper/Paper";
import { useTheme } from "@ui/hooks/useTheme";
import type { ThemeMode } from "@ui/types";

import { themes as allThemes } from "@themes/index";

import { useNavigate } from "@tanstack/react-router";
import { sortThemes } from "@ui/utils/sortThemes";
import { startCase } from "lodash";

export const PlaygrondLeftSidebar = () => {
    const { mode, changeMode, changeTheme } = useTheme();

    const navigate = useNavigate();

    const themes = allThemes.filter((theme) => theme.type === mode);

    const components = {
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
                name: "Radio Button",
                link: "/ui/radio-button",
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

    return (
        <Paper
            p={20}
            ml={20}
            mt={40}
            justifyContent="center"
            height="100%"
            width={300}
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
                {Object.entries(components).map(([key, value]) => (
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
                                    color="neutral"
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
                ))}
            </Stack>
        </Paper>
    );
};
