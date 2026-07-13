import type { GameCatalogEntry } from "./gameCatalog.types";
import { FALLBACK_GAME_CATALOG } from "./builtinGameCatalog";
import { applyGameCatalogOverrides } from "./gameCatalogOverrides";

const STORAGE_KEY = "mutualzz.remoteGameCatalog";

type RemoteCatalogPayload = {
  updatedAt: number;
  games: GameCatalogEntry[];
};

let memoryCatalog: GameCatalogEntry[] | null = null;
let memoryUpdatedAt = 0;
let loadPromise: Promise<void> | null = null;
let catalogByName = new Map<string, GameCatalogEntry>();
let catalogById = new Map<string, GameCatalogEntry>();

function rebuildNameIndex(games: GameCatalogEntry[]) {
  catalogByName = new Map();
  catalogById = new Map();
  for (const entry of games) {
    catalogByName.set(entry.name.trim().toLowerCase(), entry);
    catalogById.set(entry.id, entry);
  }
}

function setCatalog(games: GameCatalogEntry[], updatedAt: number) {
  memoryCatalog = applyGameCatalogOverrides(games);
  memoryUpdatedAt = updatedAt;
  rebuildNameIndex(memoryCatalog);
}

function normalizeEntry(entry: GameCatalogEntry): GameCatalogEntry | null {
  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const exes = Array.isArray(entry.exes)
    ? entry.exes
        .filter((exe): exe is string => typeof exe === "string")
        .map((exe) => exe.trim().toLowerCase())
        .filter(Boolean)
    : [];
  if (!id || !name || !exes.length) return null;
  return { id, name, exes };
}

function readCached(): RemoteCatalogPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RemoteCatalogPayload;
    if (!parsed || !Array.isArray(parsed.games)) return null;
    const games = parsed.games
      .map((entry) => normalizeEntry(entry))
      .filter((entry): entry is GameCatalogEntry => entry !== null);
    if (!games.length) return null;
    return {
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
      games
    };
  } catch {
    return null;
  }
}

function writeCached(payload: RemoteCatalogPayload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function findOfficialGameByName(name: string): GameCatalogEntry | null {
  hydrateFromCache();
  const key = name.trim().toLowerCase();
  if (!key) return null;
  return catalogByName.get(key) ?? null;
}

export function findOfficialGameById(id: string): GameCatalogEntry | null {
  hydrateFromCache();
  const key = id.trim();
  if (!key) return null;
  return catalogById.get(key) ?? null;
}

function hydrateFromCache() {
  if (memoryCatalog) return;
  const cached = readCached();
  if (cached) {
    setCatalog(cached.games, cached.updatedAt);
    return;
  }
  setCatalog(FALLBACK_GAME_CATALOG, 0);
}

export function getOfficialGameCatalog(): GameCatalogEntry[] {
  hydrateFromCache();
  return memoryCatalog ?? FALLBACK_GAME_CATALOG;
}

export function getRemoteGameCatalogUpdatedAt() {
  hydrateFromCache();
  return memoryUpdatedAt;
}

export async function ensureRemoteGameCatalog(
  fetcher: () => Promise<RemoteCatalogPayload>
): Promise<void> {
  hydrateFromCache();
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const payload = await fetcher();
      const games = (payload.games ?? [])
        .map((entry) => normalizeEntry(entry))
        .filter((entry): entry is GameCatalogEntry => entry !== null);
      if (!games.length) return;

      const updatedAt =
        typeof payload.updatedAt === "number" ? payload.updatedAt : Date.now();
      setCatalog(games, updatedAt);
      writeCached({ updatedAt, games });
    } catch {
      return;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}
