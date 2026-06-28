export const STATUS_DURATION_OPTIONS = [
  { label: "15 minutes", durationMs: 15 * 60_000 },
  { label: "1 hour", durationMs: 60 * 60_000 },
  { label: "4 hours", durationMs: 4 * 60 * 60_000 },
  { label: "1 day", durationMs: 24 * 60 * 60_000 },
  { label: "3 days", durationMs: 3 * 24 * 60 * 60_000 },
  { label: "Forever", durationMs: null }
] as const;

export type StatusDurationOption = (typeof STATUS_DURATION_OPTIONS)[number];

export const IDLE_THRESHOLD_OPTIONS = [
  { label: "1 minute", ms: 1 * 60_000 },
  { label: "5 minutes", ms: 5 * 60_000 },
  { label: "10 minutes", ms: 10 * 60_000 },
  { label: "15 minutes", ms: 15 * 60_000 },
  { label: "30 minutes", ms: 30 * 60_000 }
] as const;

export type IdleThresholdOption = (typeof IDLE_THRESHOLD_OPTIONS)[number];
