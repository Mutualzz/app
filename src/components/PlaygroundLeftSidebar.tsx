import { useTheme } from "@contexts/ThemeManager";
import { useNavigate } from "@tanstack/react-router";
import { themeNames, type AllThemes } from "@themes/index";
import { Divider } from "@ui/data-display/Divider/Divider";
import { Button } from "@ui/inputs/Button/Button";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";
import startCase from "lodash/startCase";

export const PlaygrondLeftSidebar = () => {
    const { changeTheme } = useTheme();

    const navigate = useNavigate();

    const inputComponents = [
        {
            name: "Button",
            link: "/ui/button",
        },
    ];

    const feedbackComponents = [
        {
            name: "Circular Progress",
            link: "/ui/circular-progress",
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
            <Stack direction="column" gap={10}>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    gap={10}
                >
                    <h3>Theme</h3>
                    <select
                        onChange={(e) => {
                            changeTheme(e.target.value as AllThemes);
                        }}
                        defaultValue="baseDark"
                    >
                        {themeNames.map((theme) => (
                            <option key={theme} value={theme}>
                                {startCase(theme)}
                            </option>
                        ))}
                    </select>
                </Stack>
                <Divider>Input</Divider>
                <Stack direction="column" gap={10}>
                    {inputComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color="primary"
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
                <Stack direction="column" gap={10}>
                    {feedbackComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color="primary"
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
                <Stack direction="column" gap={10}>
                    {dataDisplayComponents.map((button, i) => (
                        <Button
                            key={i}
                            variant="solid"
                            color="primary"
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
