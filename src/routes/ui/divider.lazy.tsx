import { createLazyFileRoute } from "@tanstack/react-router";
import { Divider } from "@ui/data-display/Divider/Divider";
import { Stack } from "@ui/layout/Stack/Stack";
import { Paper } from "@ui/surfaces/Paper/Paper";

export const Route = createLazyFileRoute("/ui/divider")({
    component: PlaygroundDivider,
});

function PlaygroundDivider() {
    return (
        <Stack direction="column" gap={20} alignItems="baseline">
            <Stack
                direction="row"
                gap={20}
                alignItems="baseline"
                paddingTop={40}
            >
                <Paper
                    direction="column"
                    alignItems="center"
                    gap={10}
                    padding={20}
                >
                    <label>Vertical Divider</label>
                    <Stack direction="row" gap={10}>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                        <Divider orientation="vertical" />
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    </Stack>
                </Paper>
                <Paper
                    direction="column"
                    alignItems="center"
                    gap={10}
                    padding={20}
                >
                    <label>Vertical Divider with Text</label>
                    <Stack direction="row" gap={10}>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                        <Divider orientation="vertical">Text</Divider>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    </Stack>
                </Paper>
            </Stack>
            <Stack direction="row" gap={20} alignItems="baseline">
                <Paper
                    direction="column"
                    alignItems="center"
                    gap={10}
                    padding={20}
                >
                    <label>Horizontal Divider</label>
                    <Stack direction="column" gap={10}>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                        <Divider orientation="horizontal" />
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    </Stack>
                </Paper>
                <Paper
                    direction="column"
                    alignItems="center"
                    gap={10}
                    padding={20}
                >
                    <label>Horizontal Divider with Text</label>
                    <Stack direction="column" gap={10}>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                        <Divider orientation="horizontal">Text</Divider>
                        <Paper
                            elevation={3}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        />
                    </Stack>
                </Paper>
            </Stack>
        </Stack>
    );
}
