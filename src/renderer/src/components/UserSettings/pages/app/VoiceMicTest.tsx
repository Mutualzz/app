import { Button } from "@components/Button";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import { createMicProcessedTrack } from "@utils/rnnoiseFilter";
import { voiceVolumeToGain } from "@utils/voiceSettings.utils";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const BAR_COUNT = 40;

export const VoiceMicTest = observer(() => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const app = useAppStore();
  const settings = app.settings;
  const voice = app.voice;
  const [testing, setTesting] = useState(false);
  const [level, setLevel] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const testingRef = useRef(false);
  const monitorGainRef = useRef<GainNode | null>(null);

  const stop = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cleanupRef.current?.();
    cleanupRef.current = null;
    monitorGainRef.current = null;
    testingRef.current = false;
    setLevel(0);
    setTesting(false);
    voice.endMicTestIsolation();
  };

  useEffect(() => () => stop(), []);

  useEffect(() => {
    if (!testingRef.current) return;
    stop();
  }, [voice.currentInputDeviceId, settings?.noiseSuppression]);

  useEffect(() => {
    if (!monitorGainRef.current || !settings) return;
    monitorGainRef.current.gain.value = voiceVolumeToGain(
      settings.microphoneVolume
    );
  }, [settings?.microphoneVolume]);

  const start = async () => {
    if (!settings) return;
    stop();
    testingRef.current = true;
    setTesting(true);
    voice.beginMicTestIsolation();
    try {
      const wantNs = settings.noiseSuppression !== false;
      const constraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: !wantNs,
        autoGainControl: true,
        channelCount: 1
      };
      if (voice.currentInputDeviceId) {
        constraints.deviceId = { ideal: voice.currentInputDeviceId };
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints,
        video: false
      });
      const [rawTrack] = stream.getAudioTracks();
      if (!rawTrack) {
        stream.getTracks().forEach((t) => t.stop());
        testingRef.current = false;
        setTesting(false);
        voice.endMicTestIsolation();
        return;
      }

      const audioContext = new AudioContext({ sampleRate: 48000 });
      const handle = await createMicProcessedTrack(audioContext, rawTrack, {
        useRnnoise: wantNs,
        gain: voiceVolumeToGain(settings.microphoneVolume)
      });

      if (!testingRef.current) {
        handle.dispose();
        stream.getTracks().forEach((t) => t.stop());
        void audioContext.close().catch(() => {});
        return;
      }

      if (wantNs && !handle.usedRnnoise) {
        try {
          await rawTrack.applyConstraints({
            noiseSuppression: true,
            autoGainControl: true
          });
        } catch {}
      }

      monitorGainRef.current = handle.micGainNode;
      const meterStream = new MediaStream([handle.processedTrack]);
      const source = audioContext.createMediaStreamSource(meterStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      source.connect(audioContext.destination);
      const data = new Uint8Array(analyser.fftSize);

      if (voice.currentOutputDeviceId && "setSinkId" in audioContext) {
        try {
          await (
            audioContext as AudioContext & {
              setSinkId: (id: string) => Promise<void>;
            }
          ).setSinkId(voice.currentOutputDeviceId);
        } catch {}
      }

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i]! - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      cleanupRef.current = () => {
        try {
          source.disconnect();
        } catch {}
        handle.dispose();
        stream.getTracks().forEach((t) => t.stop());
        void audioContext.close().catch(() => {});
      };
    } catch {
      testingRef.current = false;
      setTesting(false);
      voice.endMicTestIsolation();
    }
  };

  if (!settings) return null;

  return (
    <Stack direction="column" spacing={2} width="100%">
      <Typography level="body-sm" textColor="muted">
        {t("voice.micTest")}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" width="100%">
        <Button
          variant="soft"
          color="neutral"
          onClick={() => {
            if (testing) stop();
            else void start();
          }}
          css={{ alignSelf: "center", minWidth: "5.5rem", flexShrink: 0 }}
        >
          {testing ? t("voice.micTestStop") : t("voice.micTestStart")}
        </Button>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="flex-end"
          height={72}
          flex={1}
          minWidth={0}
        >
          {Array.from({ length: BAR_COUNT }, (_, i) => {
            const threshold = (i + 1) / BAR_COUNT;
            const active = testing && level >= threshold * 0.75;
            const hot = active && threshold > 0.85;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 3,
                  height: `${28 + (i / (BAR_COUNT - 1)) * 44}px`,
                  borderRadius: 2,
                  backgroundColor: hot
                    ? theme.colors.warning
                    : active
                      ? theme.colors.success
                      : `${theme.typography.colors.muted}44`,
                  transition: "background-color 60ms linear"
                }}
              />
            );
          })}
        </Stack>
      </Stack>
      <Typography level="body-xs" textColor="muted">
        {testing ? t("voice.micTestListeningHint") : t("voice.micTestHint")}
      </Typography>
    </Stack>
  );
});
