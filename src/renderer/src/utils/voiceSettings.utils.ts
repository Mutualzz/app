export type VoiceInputMode = "voice_activity" | "push_to_talk";

export type ScreenShareQuality =
  | "720p15"
  | "720p30"
  | "1080p30"
  | "1080p60"
  | "source";

export interface ScreenShareCaptureConfig {
  sourceId: string | null;
  includeAudio: boolean;
  quality: ScreenShareQuality;
}

export const DEFAULT_SCREEN_SHARE_QUALITY: ScreenShareQuality = "1080p30";

export const SCREEN_SHARE_QUALITY_OPTIONS: Array<{
  value: ScreenShareQuality;
  label: string;
}> = [
  { value: "720p15", label: "720p 15fps" },
  { value: "720p30", label: "720p 30fps" },
  { value: "1080p30", label: "1080p 30fps" },
  { value: "1080p60", label: "1080p 60fps" },
  { value: "source", label: "Source" }
];

export const DEFAULT_VOICE_INPUT_SENSITIVITY = 35;
export const DEFAULT_PUSH_TO_TALK_KEY = "Space";

export function formatKeyCode(code: string) {
  if (code === "Space") return "Space";
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return `Numpad ${code.slice(6)}`;
  return code;
}

export function sensitivityToThreshold(
  sensitivity: number,
  auto: boolean
): number {
  if (auto) return 0.05;
  const clamped = Math.min(100, Math.max(0, sensitivity));
  return 0.01 + (clamped / 100) * 0.14;
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function clampUserVolume(volume: number) {
  return Math.min(200, Math.max(0, Math.round(volume)));
}

export function getScreenShareQualityPreset(quality: ScreenShareQuality) {
  switch (quality) {
    case "720p15":
      return { maxWidth: 1280, maxHeight: 720, maxFrameRate: 15 };
    case "720p30":
      return { maxWidth: 1280, maxHeight: 720, maxFrameRate: 30 };
    case "1080p30":
      return { maxWidth: 1920, maxHeight: 1080, maxFrameRate: 30 };
    case "1080p60":
      return { maxWidth: 1920, maxHeight: 1080, maxFrameRate: 60 };
    case "source":
      return { maxWidth: undefined, maxHeight: undefined, maxFrameRate: 30 };
  }
}

export function getScreenShareCodecOptions(quality: ScreenShareQuality) {
  switch (quality) {
    case "720p15":
      return { videoGoogleStartBitrate: 800, videoGoogleMaxBitrate: 2500 };
    case "720p30":
      return { videoGoogleStartBitrate: 1200, videoGoogleMaxBitrate: 4000 };
    case "1080p30":
      return { videoGoogleStartBitrate: 1500, videoGoogleMaxBitrate: 8000 };
    case "1080p60":
      return { videoGoogleStartBitrate: 2500, videoGoogleMaxBitrate: 12000 };
    case "source":
      return { videoGoogleStartBitrate: 2500, videoGoogleMaxBitrate: 16000 };
  }
}
