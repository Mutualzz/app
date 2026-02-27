import { observer } from "mobx-react-lite";
import { Divider, Option, Select, Stack, Typography } from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores.ts";
import { Paper } from "@components/Paper.tsx";
import { Button } from "@components/Button.tsx";
import { useState } from "react";

export const AppVoiceVideoSettings = observer(() => {
    const app = useAppStore();
    const [showCamera, setShowCamera] = useState(false);

    const voice = app.voice;

    const inputs = voice.inputs;
    const outputs = voice.outputs;

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
                            value={voice.currentInputDevice?.deviceId ?? ""}
                            disabled={inputs.length === 0}
                            onValueChange={(value) => {
                                if (Array.isArray(value)) return;
                                if (typeof value !== "string") return;

                                voice.setInputDevice(value);
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
                            value={voice.currentOutputDevice?.deviceId ?? ""}
                            onValueChange={(value) => {
                                if (Array.isArray(value)) return;
                                if (typeof value !== "string") return;

                                voice.setOutputDevice(value);
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
                <Stack direction="column">
                    <Paper
                        justifyContent="center"
                        alignItems="center"
                        elevation={app.settings?.preferEmbossed ? 1 : 0}
                        p={10}
                    >
                        {!showCamera && (
                            <Button color="primary">Test Camera</Button>
                        )}
                        {showCamera && <></>}
                    </Paper>
                </Stack>
            </Stack>
        </Stack>
    );
});
