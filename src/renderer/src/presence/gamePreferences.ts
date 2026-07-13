export type GamePreference = {
  share: boolean;
  lastPlayedAt: number | null;
  displayName?: string | null;
  lastExePath?: string | null;
  coverImageId?: string | null;
  iconImageId?: string | null;
};

const STORAGE_KEY = "mutualzz.gamePreferences";

function readAll(): Record<string, GamePreference> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, GamePreference> = {};
    for (const [id, value] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (!value || typeof value !== "object") continue;
      const row = value as GamePreference;
      out[id] = {
        share: row.share !== false,
        lastPlayedAt:
          typeof row.lastPlayedAt === "number" ? row.lastPlayedAt : null,
        displayName:
          typeof row.displayName === "string" ? row.displayName : null,
        lastExePath:
          typeof row.lastExePath === "string" ? row.lastExePath : null,
        coverImageId:
          typeof row.coverImageId === "string" ? row.coverImageId : null,
        iconImageId:
          typeof row.iconImageId === "string"
            ? row.iconImageId
            : typeof row.coverImageId === "string"
              ? row.coverImageId
              : null
      };
    }
    return out;
  } catch {
    return {};
  }
}

function writeAll(prefs: Record<string, GamePreference>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function emptyPref(): GamePreference {
  return {
    share: true,
    lastPlayedAt: null,
    displayName: null,
    lastExePath: null,
    coverImageId: null,
    iconImageId: null
  };
}

export function getGamePreference(id: string): GamePreference {
  return readAll()[id] ?? emptyPref();
}

export function isGameShared(id: string): boolean {
  return getGamePreference(id).share;
}

export function setGameShare(id: string, share: boolean) {
  const prefs = readAll();
  const prev = prefs[id] ?? emptyPref();
  prefs[id] = { ...prev, share };
  writeAll(prefs);
}

export function setGameDisplayName(id: string, displayName: string | null) {
  const prefs = readAll();
  const prev = prefs[id] ?? emptyPref();
  prefs[id] = { ...prev, displayName: displayName?.trim() || null };
  writeAll(prefs);
}

export function setGameCoverImageId(id: string, coverImageId: string | null) {
  setGameIconImageId(id, coverImageId);
}

export function setGameIconImageId(id: string, iconImageId: string | null) {
  const prefs = readAll();
  const prev = prefs[id] ?? emptyPref();
  prefs[id] = {
    ...prev,
    iconImageId: iconImageId?.trim() || null,
    coverImageId: null
  };
  writeAll(prefs);
}

export function isFullExePath(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /[\\/]/.test(trimmed) || /^[a-zA-Z]:/.test(trimmed);
}

export function touchGamePlayed(
  updates: Array<{ id: string; exePath?: string | null }>,
  at = Date.now()
) {
  if (!updates.length) return;
  const prefs = readAll();
  for (const update of updates) {
    const prev = prefs[update.id] ?? emptyPref();
    const nextPath = isFullExePath(update.exePath)
      ? update.exePath.trim()
      : prev.lastExePath || null;
    prefs[update.id] = {
      ...prev,
      lastPlayedAt: at,
      lastExePath: nextPath
    };
  }
  writeAll(prefs);
}

export function listGamePreferences(): Record<string, GamePreference> {
  return readAll();
}
