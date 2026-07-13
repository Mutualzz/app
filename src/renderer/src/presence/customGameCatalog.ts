import type { CustomGameCatalogEntry, GameCatalogEntry } from "./gameCatalog.types";
import { getOfficialGameCatalog } from "./remoteGameCatalog";

function normalizeExe(exe: string) {
  const key = exe.trim().toLowerCase();
  if (!key) return "";
  return key.endsWith(".exe") ? key : `${key}.exe`;
}

function isOfficialGameExe(exe: string): boolean {
  const key = normalizeExe(exe);
  if (!key) return false;
  return getOfficialGameCatalog().some((entry) =>
    entry.exes.some((e) => normalizeExe(e) === key)
  );
}

const STORAGE_KEY = "mutualzz.customGameCatalog";

function readCustom(): CustomGameCatalogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const assumed = entry as CustomGameCatalogEntry;
        const id = typeof assumed.id === "string" ? assumed.id.trim() : "";
        const name = typeof assumed.name === "string" ? assumed.name.trim() : "";
        const exes = Array.isArray(assumed.exes)
          ? assumed.exes
              .filter((e): e is string => typeof e === "string")
              .map((e) => e.trim().toLowerCase())
              .filter(Boolean)
          : [];
        if (!id || !name || !exes.length) return null;
        return {
          id,
          name,
          exes,
          createdAt:
            typeof assumed.createdAt === "number" ? assumed.createdAt : Date.now()
        } satisfies CustomGameCatalogEntry;
      })
      .filter((e): e is CustomGameCatalogEntry => e !== null);
  } catch {
    return [];
  }
}

function writeCustom(entries: CustomGameCatalogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function listCustomGames(): CustomGameCatalogEntry[] {
  return readCustom();
}

export function findCustomGameByName(name: string): CustomGameCatalogEntry | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  return readCustom().find((entry) => entry.name.trim().toLowerCase() === key) ?? null;
}

export function findCustomGameById(id: string): CustomGameCatalogEntry | null {
  const key = id.trim();
  if (!key) return null;
  return readCustom().find((entry) => entry.id === key) ?? null;
}

export function addCustomGame(input: {
  name: string;
  exes: string[];
  id?: string;
}): CustomGameCatalogEntry {
  const name = input.name.trim();
  const exes = input.exes
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!name || !exes.length) {
    throw new Error("Custom game requires a name and at least one exe");
  }
  if (exes.some((exe) => isOfficialGameExe(exe))) {
    throw new Error("Cannot add an official catalog game as custom");
  }

  const id =
    input.id?.trim() ||
    `custom-${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

  const entry: CustomGameCatalogEntry = {
    id,
    name,
    exes,
    createdAt: Date.now()
  };

  const next = readCustom().filter((e) => e.id !== id);
  next.push(entry);
  writeCustom(next);
  return entry;
}

export function removeCustomGame(id: string) {
  writeCustom(readCustom().filter((e) => e.id !== id));
}

export function renameCustomGame(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const next = readCustom().map((entry) =>
    entry.id === id ? { ...entry, name: trimmed } : entry
  );
  writeCustom(next);
}

export function customGamesAsCatalog(): GameCatalogEntry[] {
  return readCustom().map(({ id, name, exes }) => ({ id, name, exes }));
}
