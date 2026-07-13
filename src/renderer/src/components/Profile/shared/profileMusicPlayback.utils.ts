const STORAGE_KEY = "mutualzz.profile-music-volume";

export const DEFAULT_PROFILE_MUSIC_VOLUME = 45;

export function readProfileMusicVolumePercent(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return DEFAULT_PROFILE_MUSIC_VOLUME;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_PROFILE_MUSIC_VOLUME;
    return Math.min(100, Math.max(0, Math.round(parsed)));
  } catch {
    return DEFAULT_PROFILE_MUSIC_VOLUME;
  }
}

export function writeProfileMusicVolumePercent(percent: number) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  try {
    localStorage.setItem(STORAGE_KEY, String(clamped));
  } catch {
    // ignore storage failures
  }
  return clamped;
}

export function profileMusicVolumeToGain(percent: number) {
  const normalized = Math.min(1, Math.max(0, percent / 100));
  return normalized * normalized;
}
