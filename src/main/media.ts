import type { Worker } from "node:worker_threads";
import createMediaWorker from "./mediaWorker?nodeWorker";

export interface MediaSnapshot {
  trackKey: string;
  sourceAppId: string;
  title: string;
  artist: string;
  album: string;
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  startedAt: number | null;
}

export interface MediaThumbnail {
  trackKey: string;
  bytes: Uint8Array;
}

type MediaWorkerMessage =
  | { kind: "snapshot"; snapshot: MediaSnapshot | null }
  | { kind: "thumbnail"; trackKey: string; bytes: Uint8Array };

let mediaWorker: Worker | null = null;
let latestMedia: MediaSnapshot | null = null;
let latestThumbnail: MediaThumbnail | null = null;
let mediaUpdatedListener: (() => void) | null = null;

export function getLatestMedia() {
  return latestMedia;
}

export function getLatestMediaThumbnail() {
  if (!latestMedia || latestThumbnail?.trackKey !== latestMedia.trackKey)
    return null;
  return latestThumbnail;
}

export function setMediaUpdatedListener(listener: () => void) {
  mediaUpdatedListener = listener;
}

export function startMediaWatcher() {
  if (process.platform !== "win32" || mediaWorker) return;

  mediaWorker = createMediaWorker({});

  mediaWorker.on("message", (message: MediaWorkerMessage) => {
    if (message.kind === "thumbnail") {
      latestThumbnail = { trackKey: message.trackKey, bytes: message.bytes };
    } else {
      latestMedia = message.snapshot;
    }
    mediaUpdatedListener?.();
  });

  mediaWorker.on("error", (err) => {
    console.error("[Media] worker error", err);
  });

  mediaWorker.on("exit", (code) => {
    console.log("[Media] worker exited", code);
    mediaWorker = null;
    latestMedia = null;
    mediaUpdatedListener?.();
    latestThumbnail = null;
  });
}

export function stopMediaWatcher() {
  void mediaWorker?.terminate();
  mediaWorker = null;
  latestMedia = null;
  latestThumbnail = null;
}
