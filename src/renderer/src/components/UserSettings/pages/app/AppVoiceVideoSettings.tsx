import { observer } from "mobx-react-lite";
import {
  Divider,
  Option,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tooltip,
  Typography
} from "@mutualzz/ui-web";
import {
  SettingsSelectField,
  SettingsSliderField,
  SettingsToggleRow,
} from "@components/UserSettings/SettingsField";
import { IconButton } from "@components/IconButton";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const testStreamRef = useRef<MediaStream | null>(null);

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

  const stopTestStream = () => {
    const stream = testStreamRef.current;
    if (!stream) return;
    for (const track of stream.getTracks()) {
      track.stop();
    }
    testStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    app.voice.setupTracks();
    return () => {
      stopTestStream();
    };
  }, []);

  useEffect(() => {
    if (!showCamera) {
      stopTestStream();
      return;
    }

    let cancelled = false;

    const startTest = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: fallbackCameraId ? { deviceId: fallbackCameraId } : true,
          audio: false
        });

        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        stopTestStream();
        testStreamRef.current = stream;

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
      cancelled = true;
      stopTestStream();
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
            <SettingsSelectField
              title={t("voice.microphone")}
              value={inputValue}
              onChange={(value) => voice.setInputDeviceId(value)}
              options={inputs.map((input) => ({
                value: input.deviceId,
                label: input.label || t("voice.unknownMicrophone"),
              }))}
            />
          </Stack>
          <Stack direction="column" flex={1}>
            <SettingsSelectField
              title={t("voice.speaker")}
              value={outputValue}
              onChange={(value) => voice.setOutputDeviceId(value)}
              options={outputs.map((output) => ({
                value: output.deviceId,
                label: output.label || t("voice.unknownSpeaker"),
              }))}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={3} mt={2} width="100%">
          <Stack direction="column" spacing={1.5} flex={1}>
            <SettingsSliderField
              title={t("voice.microphoneVolume")}
              min={0}
              max={200}
              step={1}
              value={settings.microphoneVolume}
              formatValueLabel={(value) => `${value}%`}
              onChange={(value) => settings.setMicrophoneVolume(value)}
            />
          </Stack>
          <Stack direction="column" spacing={1.5} flex={1}>
            <SettingsSliderField
              title={t("voice.speakerVolume")}
              min={0}
              max={200}
              step={1}
              value={settings.speakerVolume}
              formatValueLabel={(value) => `${value}%`}
              onChange={(value) => settings.setSpeakerVolume(value)}
            />
          </Stack>
        </Stack>

        <Stack mt={2}>
          <SettingsToggleRow
            title={t("voice.noiseSuppression")}
            description={t("voice.noiseSuppressionDescription")}
            checked={settings.noiseSuppression}
            disabled={voice.noiseSuppressionPending}
            onChange={(checked) => settings.setNoiseSuppression(checked)}
          />
        </Stack>
        {voice.noiseSuppressionPending && (
          <Typography level="body-xs" textColor="muted">
            {t("voice.noiseSuppressionApplying")}
          </Typography>
        )}

        <Typography level="body-xs" textColor="muted">
          {t("voice.perUserVolumeDescription")}
        </Typography>

        <VoiceMicTest />

        <Stack direction="column" spacing={2} mt={2}>
          <Typography level="body-sm" textColor="muted">
            {t("voice.inputMode")}
          </Typography>
          <RadioGroup
            value={
              voice.hasActiveVoiceTarget
                ? voice.effectiveVoiceInputMode
                : settings.voiceInputMode
            }
            color="neutral"
            onChange={(_, value) => {
              if (value === "voice_activity" || value === "push_to_talk") {
                settings.setVoiceInputMode(value);
              }
            }}
          >
            <Radio
              value="voice_activity"
              label={t("voice.voiceActivity")}
              disabled={
                voice.hasActiveVoiceTarget && !voice.canUseVadInCurrentChannel
              }
            />
            <Radio value="push_to_talk" label={t("voice.pushToTalk")} />
          </RadioGroup>
          {voice.hasActiveVoiceTarget && !voice.canUseVadInCurrentChannel && (
            <Typography level="body-xs" textColor="muted">
              {t("voice.vadPermissionRequired")}
            </Typography>
          )}
        </Stack>

        {(voice.hasActiveVoiceTarget
          ? voice.effectiveVoiceInputMode
          : settings.voiceInputMode) === "push_to_talk" && (
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

        <SettingsToggleRow
          title={t("voice.autoSensitivity")}
          description={t("voice.autoSensitivityDescription")}
          checked={settings.voiceInputSensitivityAuto}
          onChange={(checked) =>
            settings.setVoiceInputSensitivityAuto(checked)
          }
        />

        {!settings.voiceInputSensitivityAuto && (
          <SettingsSliderField
            title={t("voice.inputSensitivity")}
            min={0}
            max={100}
            step={1}
            value={settings.voiceInputSensitivity}
            onChange={(value) => settings.setVoiceInputSensitivity(value)}
          />
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
