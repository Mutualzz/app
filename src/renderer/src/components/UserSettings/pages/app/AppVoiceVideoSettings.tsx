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
import { useTranslation } from "react-i18next";
import { VoiceMicTest } from "./VoiceMicTest";

export const AppVoiceVideoSettings = observer(() => {
  const { t } = useTranslation("settings");
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
    <Stack spacing={7.5} pt={2.5} pb={5} direction="column">
      <Stack spacing={2.5} direction="column">
        <Typography fontSize={20}>{t("voice.title")}</Typography>
        <Divider
          textColor="muted"
          css={{
            opacity: 0.5
          }}
        />
        <Stack direction="row" justifyContent="center" spacing={7.5}>
          <Stack direction="column" flex={1}>
            <Typography>{t("voice.microphone")}</Typography>
            <Select
              placeholder={
                inputs.length === 0
                  ? t("voice.noMicrophones")
                  : t("voice.selectMicrophone")
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
                  {input.label || t("voice.unknownMicrophone")}
                </Option>
              ))}
            </Select>
          </Stack>
          <Stack direction="column" flex={1}>
            <Typography>{t("voice.speaker")}</Typography>
            <Select
              placeholder={
                outputs.length === 0
                  ? t("voice.noSpeakers")
                  : t("voice.selectSpeaker")
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
                  {output.label || t("voice.unknownSpeaker")}
                </Option>
              ))}
            </Select>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3} mt={2} width="100%">
          <Stack direction="column" spacing={1.5} flex={1}>
            <Typography level="body-sm" textColor="muted">
              {t("voice.microphoneVolume")}
            </Typography>
            <Slider
              min={0}
              max={200}
              color="neutral"
              value={settings.microphoneVolume}
              onChange={(_, value) =>
                settings.setMicrophoneVolume(
                  typeof value === "number" ? value : value[0]
                )
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
          </Stack>
          <Stack direction="column" spacing={1.5} flex={1}>
            <Typography level="body-sm" textColor="muted">
              {t("voice.speakerVolume")}
            </Typography>
            <Slider
              min={0}
              max={200}
              color="neutral"
              value={settings.speakerVolume}
              onChange={(_, value) =>
                settings.setSpeakerVolume(
                  typeof value === "number" ? value : value[0]
                )
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
            />
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Stack direction="column" spacing={0.5}>
            <Typography>{t("voice.noiseSuppression")}</Typography>
            <Typography level="body-xs" textColor="muted">
              {t("voice.noiseSuppressionDescription")}
            </Typography>
          </Stack>
          <Switch
            checked={settings.noiseSuppression}
            disabled={voice.noiseSuppressionPending}
            onChange={() =>
              settings.setNoiseSuppression(!settings.noiseSuppression)
            }
          />
        </Stack>
        {voice.noiseSuppressionPending && (
          <Typography level="body-xs" textColor="muted">
            {t("voice.noiseSuppressionApplying")}
          </Typography>
        )}

        <VoiceMicTest />

        <Stack direction="column" spacing={2} mt={2}>
          <Typography level="body-sm" textColor="muted">
            {t("voice.inputMode")}
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
            <Radio value="voice_activity" label={t("voice.voiceActivity")} />
            <Radio value="push_to_talk" label={t("voice.pushToTalk")} />
          </RadioGroup>
        </Stack>

        {settings.voiceInputMode === "push_to_talk" && (
          <Stack direction="column" spacing={1.5}>
            <Typography level="body-sm" textColor="muted">
              {t("voice.shortcut")}
            </Typography>
            <Button
              variant="soft"
              color="neutral"
              onClick={() => voice.startRecordingPushToTalkKey()}
              css={{ alignSelf: "flex-start" }}
            >
              {voice.recordingPushToTalkKey
                ? t("voice.pressAKey")
                : t("voice.editKeybind", { key: voice.pushToTalkKeyLabel })}
            </Button>
            <Typography level="body-xs" textColor="muted">
              {t("voice.currentKey", {
                key: formatKeyCode(settings.pushToTalkKey)
              })}
            </Typography>
          </Stack>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="column" spacing={0.5}>
            <Typography>{t("voice.autoSensitivity")}</Typography>
            <Typography level="body-xs" textColor="muted">
              {t("voice.autoSensitivityDescription")}
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
              {t("voice.inputSensitivity")}
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
        <Typography fontSize={20}>{t("voice.camera")}</Typography>
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
                  {t("voice.testCamera")}
                </Button>

                <Select
                  placeholder={
                    cameras.length === 0
                      ? t("voice.noCameras")
                      : t("voice.selectCamera")
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
                      {camera.label || t("voice.unknownCamera")}
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
                <Tooltip content={t("voice.stopTesting")}>
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
