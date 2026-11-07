import { parentPort } from "node:worker_threads";
import {
  PlaybackStatus,
  SMTCMonitor,
  type MediaInfo
} from "@coooookies/windows-smtc-monitor";

const monitor = new SMTCMonitor();

const SEEK_TOLERANCE_MS = 2000;
const REPORT_DEBOUNCE_MS = 250;
const MAX_THUMBNAIL_BYTES = 8 * 1024 * 1024; // 8 MB

let lastThumbnailKey: string | null = null;

const trackKeyOf = (session: MediaInfo) =>
  [
    session.sourceAppId,
    session.media.title,
    session.media.artist,
    session.media.albumTitle
  ].join("|");

type MediaSnapshot = NonNullable<ReturnType<typeof toSnapshot>>;

const toSnapshot = (session: MediaInfo | null) => {
  if (!session || !session.media.title) return null;

  const positionMs = Math.round(session.timeline.position * 1000);
  const durationMs = Math.round(session.timeline.duration * 1000);
  const isPlaying = session.playback.playbackStatus === PlaybackStatus.PLAYING;

  return {
    trackKey: trackKeyOf(session),
    sourceAppId: session.sourceAppId,
    title: session.media.title,
    artist: session.media.artist,
    album: session.media.albumTitle,
    positionMs,
    durationMs,
    isPlaying,
    startedAt: isPlaying
      ? Math.round(session.lastUpdatedTime - positionMs)
      : null
  };
};

let lastSent: MediaSnapshot | null = null;
let reportTimer: ReturnType<typeof setTimeout> | null = null;

const hasMeaningfulChange = (
  previous: MediaSnapshot | null,
  next: MediaSnapshot | null
) => {
  if (!previous || !next) return previous !== next;

  if (
    previous.sourceAppId !== next.sourceAppId ||
    previous.title !== next.title ||
    previous.artist !== next.artist ||
    previous.durationMs !== next.durationMs ||
    previous.isPlaying !== next.isPlaying
  ) {
    return true;
  }

  if (previous.startedAt === null || next.startedAt === null) return false;

  return Math.abs(previous.startedAt - next.startedAt) > SEEK_TOLERANCE_MS;
};

const reportThumbnail = (session: MediaInfo | null) => {
  if (!session || !session.media.title) {
    lastThumbnailKey = null;
    return;
  }

  const thumbnail = session.media.thumbnail;
  if (!thumbnail || thumbnail.length === 0) return;
  if (thumbnail.length > MAX_THUMBNAIL_BYTES) return;

  const trackKey = trackKeyOf(session);
  if (trackKey === lastThumbnailKey) return;
  lastThumbnailKey = trackKey;

  const bytes = new Uint8Array(thumbnail);
  parentPort?.postMessage({ kind: "thumbnail", trackKey, bytes }, [
    bytes.buffer
  ]);
};

const report = () => {
  const session = SMTCMonitor.getCurrentMediaSession();
  reportThumbnail(session);

  const snapshot = toSnapshot(session);

  if (!hasMeaningfulChange(lastSent, snapshot)) return;

  lastSent = snapshot;
  parentPort?.postMessage({ kind: "snapshot", snapshot });
};

const scheduleReport = () => {
  if (reportTimer) clearTimeout(reportTimer);

  reportTimer = setTimeout(report, REPORT_DEBOUNCE_MS);
};

monitor.on("session-media-changed", scheduleReport);
monitor.on("session-playback-changed", scheduleReport);
monitor.on("session-timeline-changed", scheduleReport);
monitor.on("current-session-changed", scheduleReport);
monitor.on("session-added", scheduleReport);
monitor.on("session-removed", scheduleReport);

report();
