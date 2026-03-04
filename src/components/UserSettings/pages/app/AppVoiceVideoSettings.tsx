import { observer } from "mobx-react-lite";
import {
    Divider,
    IconButton,
    Option,
    Select,
    Stack,
    Tooltip,
    Typography,
} from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores.ts";
import { Paper } from "@components/Paper.tsx";
import { Button } from "@components/Button.tsx";
import { useState } from "react";
import { FaX } from "react-icons/fa6";
import { TooltipWrapper } from "@components/TooltipWrapper.tsx";

export const AppVoiceVideoSettings = observer(() => {
    const app = useAppStore();
    const [showCamera, setShowCamera] = useState(false);

    const voice = app.voice;

    const inputs = voice.inputs;
    const outputs = voice.outputs;
    const cameras = voice.cameras;

    return (
        <Stack spacing={25} mt={7.5} mx={50} direction="column">
            <Stack spacing={2.5} direction="column">
                <Typography fontSize={20}>Voice</Typography>
                <Divider
                    textColor="muted"
                    css={{
                        opacity: 0.5,
                    }}
                />
                <Stack direction="row" justifyContent="center" spacing={25}>
                    <Stack direction="column" flex={1}>
                        <Typography>Microphone</Typography>
                        <Select
                            placeholder={
                                inputs.length === 0
                                    ? "No microphones detected"
                                    : "Select a microphone"
                            }
                            value={voice.currentInputDeviceId ?? ""}
                            disabled={inputs.length === 0}
                            onValueChange={(value) => {
                                if (Array.isArray(value)) return;
                                if (typeof value !== "string") return;

                                voice.setInputDeviceId(value);
                            }}
                        >
                            {inputs.map((input) => (
                                <Option
                                    key={input.deviceId}
                                    value={input.deviceId}
                                >
                                    {input.label || "Unknown Microphone"}
                                </Option>
                            ))}
                        </Select>
                    </Stack>
                    <Stack direction="column" flex={1}>
                        <Typography>Speaker</Typography>
                        <Select
                            placeholder={
                                outputs.length === 0
                                    ? "No speakers detected"
                                    : "Select a speaker"
                            }
                            disabled={outputs.length === 0}
                            value={voice.currentOutputDeviceId ?? ""}
                            onValueChange={(value) => {
                                if (Array.isArray(value)) return;
                                if (typeof value !== "string") return;

                                voice.setOutputDeviceId(value);
                            }}
                        >
                            {outputs.map((output) => (
                                <Option
                                    key={output.deviceId}
                                    value={output.deviceId}
                                >
                                    {output.label || "Unknown Speaker"}
                                </Option>
                            ))}
                        </Select>
                    </Stack>
                </Stack>
            </Stack>
            <Stack direction="column" spacing={2.5}>
                <Typography fontSize={20}>Camera</Typography>
                <Divider
                    textColor="muted"
                    css={{
                        opacity: 0.5,
                    }}
                />
                <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Paper
                        justifyContent="center"
                        alignItems="center"
                        elevation={5}
                        width={480}
                        height={270}
                        position="relative"
                    >
                        {!showCamera && (
                            <Stack direction="column" spacing={2.5}>
                                <Button
                                    color="primary"
                                    onClick={() => setShowCamera(true)}
                                >
                                    Test Camera
                                </Button>
                                <Select
                                    placeholder={
                                        cameras.length === 0
                                            ? "No cameras detected"
                                            : "Select a camera"
                                    }
                                    disabled={cameras.length === 0}
                                    value={voice.currentCameraDeviceId ?? ""}
                                    onValueChange={(value) => {
                                        if (Array.isArray(value)) return;
                                        if (typeof value !== "string") return;

                                        voice.setCameraDeviceId(value);
                                    }}
                                >
                                    {cameras.map((camera) => (
                                        <Option
                                            key={camera.deviceId}
                                            value={camera.deviceId}
                                        >
                                            {camera.label || "Unknown Camera"}
                                        </Option>
                                    ))}
                                </Select>
                            </Stack>
                        )}
                        {showCamera && (
                            <>
                                <Tooltip
                                    content={
                                        <TooltipWrapper>
                                            Stop testing
                                        </TooltipWrapper>
                                    }
                                >
                                    <IconButton
                                        css={{
                                            position: "absolute",
                                            top: 10,
                                            right: 10,
                                        }}
                                        color="danger"
                                        variant="plain"
                                        size="sm"
                                        onClick={() => setShowCamera(false)}
                                    >
                                        <FaX />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                    </Paper>
                </Stack>
            </Stack>
        </Stack>
    );
});
