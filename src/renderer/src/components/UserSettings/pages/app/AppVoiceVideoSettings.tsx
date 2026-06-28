import { observer } from "mobx-react-lite";
import {
  Divider,
  IconButton,
  Option,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Switch,
  Tooltip,
  Typography
} from "@mutualzz/ui-web";
import { useAppStore } from "@hooks/useStores";
import { Paper } from "@components/Paper";
import { Button } from "@components/Button";
import { useEffect, useRef, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { formatKeyCode } from "@utils/voiceSettings.utils";

export const AppVoiceVideoSettings = observer(() => {
  const app = useAppStore();
  const [showCamera, setShowCamera] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const voice = app.voice;
  const settings = app.settings;

  const inputs = voice.inputs;
  const outputs = voice.outputs;
  const cameras = voice.cameras;

  const inputValue = inputs.some(
    (d) => d.deviceId === voice.currentInputDeviceId
  )
    ? (voice.currentInputDeviceId ?? "")
    : "";
  const outputValue = outputs.some(
    (d) => d.deviceId === voice.currentOutputDeviceId
  )
    ? (voice.currentOutputDeviceId ?? "")
    : "";
  const cameraValue = cameras.some(
    (d) => d.deviceId === voice.currentCameraDeviceId
  )
    ? (voice.currentCameraDeviceId ?? "")
    : "";

  const fallbackCameraId =
    cameras.find((d) => d.deviceId === voice.currentCameraDeviceId)?.deviceId ??
    cameras[0]?.deviceId ??
    null;

  useEffect(() => {
    app.voice.setupTracks();

    return () => {
      if (testStream) {
        for (const track of testStream.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!showCamera) return;

    const startTest = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: fallbackCameraId ? { deviceId: fallbackCameraId } : true,
          audio: false
        });

        setTestStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Failed to start camera test:", err);
      }
    };

    void startTest();

    return () => {
      if (testStream) {
        for (const track of testStream.getTracks()) {
          track.stop();
        }
        setTestStream(null);
      }
    };
  }, [showCamera, fallbackCameraId]);

  if (!settings) return null;

  return (
    <Stack spacing={25} mt={7.5} mx={50} direction="column">
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>Voice</Typography>
        <Divider
          textColor="muted"
          css={{
            opacity: 0.5
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
              value={inputValue}
              disabled={inputs.length === 0}
              onValueChange={(value) => {
                if (Array.isArray(value)) return;
                if (typeof value !== "string") return;

                voice.setInputDeviceId(value);
              }}
            >
              {inputs.map((input) => (
                <Option key={input.deviceId} value={input.deviceId}>
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
              value={outputValue}
              onValueChange={(value) => {
                if (Array.isArray(value)) return;
                if (typeof value !== "string") return;

                voice.setOutputDeviceId(value);
              }}
            >
              {outputs.map((output) => (
                <Option key={output.deviceId} value={output.deviceId}>
                  {output.label || "Unknown Speaker"}
                </Option>
              ))}
            </Select>
          </Stack>
        </Stack>

        <Stack direction="column" spacing={2} mt={2}>
          <Typography level="body-sm" textColor="muted">
            Input mode
          </Typography>
          <RadioGroup
            value={settings.voiceInputMode}
            color="neutral"
            onChange={(_, value) => {
              if (value === "voice_activity" || value === "push_to_talk") {
                settings.setVoiceInputMode(value);
              }
            }}
          >
            <Radio value="voice_activity" label="Voice Activity" />
            <Radio value="push_to_talk" label="Push to Talk" />
          </RadioGroup>
        </Stack>

        {settings.voiceInputMode === "push_to_talk" && (
          <Stack direction="column" spacing={1.5}>
            <Typography level="body-sm" textColor="muted">
              Shortcut
            </Typography>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => voice.startRecordingPushToTalkKey()}
              css={{ alignSelf: "flex-start" }}
            >
              {voice.recordingPushToTalkKey
                ? "Press a key..."
                : `Edit Keybind (${voice.pushToTalkKeyLabel})`}
            </Button>
            <Typography level="body-xs" textColor="muted">
              Current key: {formatKeyCode(settings.pushToTalkKey)}
            </Typography>
          </Stack>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="column" spacing={0.5}>
            <Typography>Automatically determine input sensitivity</Typography>
            <Typography level="body-xs" textColor="muted">
              Let Mutualzz decide when your mic activates
            </Typography>
          </Stack>
          <Switch
            checked={settings.voiceInputSensitivityAuto}
            onChange={() =>
              settings.setVoiceInputSensitivityAuto(
                !settings.voiceInputSensitivityAuto
              )
            }
          />
        </Stack>

        {!settings.voiceInputSensitivityAuto && (
          <Stack direction="column" spacing={1.5}>
            <Typography level="body-sm" textColor="muted">
              Input sensitivity
            </Typography>
            <Slider
              min={0}
              max={100}
              color="neutral"
              value={settings.voiceInputSensitivity}
              onChange={(_, value) =>
                settings.setVoiceInputSensitivity(
                  typeof value === "number" ? value : value[0]
                )
              }
              valueLabelDisplay="auto"
            />
          </Stack>
        )}
      </Stack>

      <Stack direction="column" spacing={2.5}>
        <Typography fontSize={20}>Camera</Typography>
        <Divider
          textColor="muted"
          css={{
            opacity: 0.5
          }}
        />
        <Stack direction="column" justifyContent="center" alignItems="center">
          <Paper
            justifyContent="center"
            alignItems="center"
            elevation={5}
            width="100%"
            maxWidth={560}
            height={315}
            position="relative"
            css={{
              overflow: "hidden",
              backgroundColor: "#000"
            }}
          >
            {!showCamera && (
              <Stack direction="column" spacing={2.5}>
                <Button
                  color="neutral"
                  onClick={() => {
                    if (!voice.currentCameraDeviceId && fallbackCameraId) {
                      voice.setCameraDeviceId(fallbackCameraId);
                    }
                    setShowCamera(true);
                  }}
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
                  value={cameraValue}
                  onValueChange={(value) => {
                    if (Array.isArray(value)) return;
                    if (typeof value !== "string") return;

                    voice.setCameraDeviceId(value);
                  }}
                >
                  {cameras.map((camera) => (
                    <Option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || "Unknown Camera"}
                    </Option>
                  ))}
                </Select>
              </Stack>
            )}

            {showCamera && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                <Tooltip content="Stop testing">
                  <IconButton
                    css={{
                      position: "absolute",
                      top: 10,
                      right: 10
                    }}
                    color="danger"
                    variant="plain"
                    size="sm"
                    onClick={() => setShowCamera(false)}
                  >
                    <XIcon />
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
