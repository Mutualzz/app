export const STATUS_DURATION_OPTIONS = [
  { labelKey: "duration.minutes", count: 15, durationMs: 15 * 60_000 },
  { labelKey: "duration.hours", count: 1, durationMs: 60 * 60_000 },
  { labelKey: "duration.hours", count: 4, durationMs: 4 * 60 * 60_000 },
  { labelKey: "duration.days", count: 1, durationMs: 24 * 60 * 60_000 },
  { labelKey: "duration.days", count: 3, durationMs: 3 * 24 * 60 * 60_000 },
  { labelKey: "duration.forever", count: null, durationMs: null }
] as const;

export type StatusDurationOption = (typeof STATUS_DURATION_OPTIONS)[number];

export const IDLE_THRESHOLD_OPTIONS = [
  { labelKey: "duration.minutes", count: 1, ms: 1 * 60_000 },
  { labelKey: "duration.minutes", count: 5, ms: 5 * 60_000 },
  { labelKey: "duration.minutes", count: 10, ms: 10 * 60_000 },
  { labelKey: "duration.minutes", count: 15, ms: 15 * 60_000 },
  { labelKey: "duration.minutes", count: 30, ms: 30 * 60_000 }
] as const;

export type IdleThresholdOption = (typeof IDLE_THRESHOLD_OPTIONS)[number];
