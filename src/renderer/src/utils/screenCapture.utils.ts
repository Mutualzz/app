import { isElectron } from "@utils/index";
import {
  getScreenShareQualityPreset,
  type ScreenShareCaptureConfig
} from "@utils/voiceSettings.utils";

export interface ScreenCaptureSource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon: string | null;
}

export function isScreenCaptureSource(source: ScreenCaptureSource) {
  return source.id.startsWith("screen:");
}

function buildElectronVideoConstraints(
  sourceId: string,
  config: ScreenShareCaptureConfig
) {
  const preset = getScreenShareQualityPreset(config.quality);
  const mandatory: Record<string, unknown> = {
    chromeMediaSource: "desktop",
    chromeMediaSourceId: sourceId,
    maxFrameRate: preset.maxFrameRate
  };

  if (preset.maxWidth) mandatory.maxWidth = preset.maxWidth;
  if (preset.maxHeight) mandatory.maxHeight = preset.maxHeight;

  return {
    audio: config.includeAudio
      ? {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sourceId
          }
        }
      : false,
    video: { mandatory }
  };
}

async function getElectronDesktopStream(
  sourceId: string,
  config: ScreenShareCaptureConfig
): Promise<MediaStream> {
  const constraints = buildElectronVideoConstraints(sourceId, config);

  try {
    return await navigator.mediaDevices.getUserMedia(
      constraints as MediaStreamConstraints
    );
  } catch {
    return await navigator.mediaDevices.getUserMedia({
      audio: constraints.audio,
      video: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: sourceId,
        maxFrameRate: getScreenShareQualityPreset(config.quality).maxFrameRate
      }
    } as MediaStreamConstraints);
  }
}

async function captureViaElectronDesktopCapturer(
  config: ScreenShareCaptureConfig,
  signal: AbortSignal
): Promise<MediaStream> {
  if (!window.api?.desktop?.listCaptureSources) {
    throw new Error("Desktop capture is not available");
  }

  const access = await window.api.desktop.getScreenCaptureAccess();
  if (access === "denied" || access === "restricted") {
    throw new Error("SCREEN_CAPTURE_DENIED");
  }

  if (!config.sourceId) {
    throw new Error("Screen share cancelled");
  }

  if (signal.aborted) throw new Error("Voice disconnected");

  const stream = await getElectronDesktopStream(config.sourceId, config);
  if (signal.aborted) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error("Voice disconnected");
  }

  return stream;
}

async function captureViaDisplayMedia(
  config: ScreenShareCaptureConfig,
  signal: AbortSignal
): Promise<MediaStream> {
  const preset = getScreenShareQualityPreset(config.quality);
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: { ideal: preset.maxFrameRate, max: preset.maxFrameRate },
      ...(preset.maxWidth && preset.maxHeight
        ? {
            width: { max: preset.maxWidth },
            height: { max: preset.maxHeight }
          }
        : {})
    },
    audio: config.includeAudio
  });

  if (signal.aborted) {
    stream.getTracks().forEach((track) => track.stop());
    throw new Error("Voice disconnected");
  }

  return stream;
}

export async function acquireScreenCaptureStream(
  config: ScreenShareCaptureConfig,
  signal: AbortSignal
): Promise<MediaStream> {
  if (signal.aborted) throw new Error("Voice disconnected");

  if (isElectron && config.sourceId) {
    try {
      return await captureViaElectronDesktopCapturer(config, signal);
    } catch (err) {
      if (signal.aborted) throw new Error("Voice disconnected");
      const message = err instanceof Error ? err.message : String(err);
      if (message === "Screen share cancelled") throw err;
      if (message === "SCREEN_CAPTURE_DENIED") throw err;

      try {
        return await captureViaDisplayMedia(config, signal);
      } catch {
        throw err;
      }
    }
  }

  return captureViaDisplayMedia(config, signal);
}

export async function openScreenCaptureSettings() {
  await window.api?.desktop?.openScreenCaptureSettings();
}
