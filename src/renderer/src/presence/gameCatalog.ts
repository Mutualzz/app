import { customGamesAsCatalog } from "./customGameCatalog";
import type { GameCatalogEntry } from "./gameCatalog.types";
import { getOfficialGameCatalog } from "./remoteGameCatalog";

export type {
  GameCatalogEntry,
  CustomGameCatalogEntry,
  GameArgMatcher
} from "./gameCatalog.types";
export {
  addCustomGame,
  removeCustomGame,
  renameCustomGame,
  listCustomGames
} from "./customGameCatalog";
export { FALLBACK_GAME_CATALOG, BUILTIN_GAME_CATALOG } from "./builtinGameCatalog";
export {
  ensureRemoteGameCatalog,
  getOfficialGameCatalog,
  getRemoteGameCatalogUpdatedAt
} from "./remoteGameCatalog";

function normalizeExe(exe: string) {
  const key = exe.trim().toLowerCase();
  if (!key) return "";
  return key.endsWith(".exe") ? key : `${key}.exe`;
}

function processBaseName(name: string) {
  const base = name.split(/[/\\]/).pop() || name;
  return normalizeExe(base);
}

export function isBuiltinGameExe(exe: string): boolean {
  const key = normalizeExe(exe);
  if (!key) return false;
  return getOfficialGameCatalog().some((entry) =>
    entry.exes.some((e) => normalizeExe(e) === key)
  );
}

export function getGameCatalog(): GameCatalogEntry[] {
  const byId = new Map<string, GameCatalogEntry>();
  const officialExes = new Set(
    getOfficialGameCatalog().flatMap((entry) =>
      entry.exes.map((exe) => normalizeExe(exe))
    )
  );

  for (const entry of getOfficialGameCatalog()) {
    byId.set(entry.id, {
      ...entry,
      exes: entry.exes.map((e) => normalizeExe(e)),
      argMatchers: entry.argMatchers?.map((matcher) => ({
        exe: normalizeExe(matcher.exe),
        includes: matcher.includes.map((s) => s.toLowerCase())
      }))
    });
  }

  for (const entry of customGamesAsCatalog()) {
    const exes = entry.exes.map((e) => normalizeExe(e));
    if (exes.some((exe) => officialExes.has(exe))) continue;
    byId.set(entry.id, {
      ...entry,
      exes
    });
  }

  return [...byId.values()];
}

export function getCatalogExeFilter(): string[] {
  const exes = new Set<string>();
  for (const entry of getGameCatalog()) {
    for (const exe of entry.exes) exes.add(normalizeExe(exe));
    for (const matcher of entry.argMatchers ?? []) {
      exes.add(normalizeExe(matcher.exe));
    }
  }
  return [...exes];
}

export function processMatchesGame(
  proc: { name: string; commandLine?: string },
  entry: GameCatalogEntry
): boolean {
  const key = processBaseName(proc.name);
  if (!key) return false;

  if (entry.exes.some((exe) => exe === key)) return true;

  const commandLine = (proc.commandLine ?? "").toLowerCase();
  for (const matcher of entry.argMatchers ?? []) {
    if (matcher.exe !== key) continue;
    if (
      matcher.includes.some((needle) => commandLine.includes(needle.toLowerCase()))
    ) {
      return true;
    }
  }

  return false;
}

export function findMatchingProcess<
  T extends { name: string; commandLine?: string; path?: string }
>(entry: GameCatalogEntry, processes: T[]): T | undefined {
  return processes.find((proc) => processMatchesGame(proc, entry));
}

export function matchGamesFromProcesses(
  processes: { name: string; commandLine?: string; path?: string }[]
): GameCatalogEntry[] {
  const catalog = getGameCatalog();
  const byExe = new Map<string, GameCatalogEntry[]>();
  const withMatchers: GameCatalogEntry[] = [];

  for (const entry of catalog) {
    for (const exe of entry.exes) {
      const key = normalizeExe(exe);
      const list = byExe.get(key);
      if (list) list.push(entry);
      else byExe.set(key, [entry]);
    }
    if (entry.argMatchers?.length) withMatchers.push(entry);
  }

  const matched = new Map<string, GameCatalogEntry>();

  for (const proc of processes) {
    const key = processBaseName(proc.name);
    for (const entry of byExe.get(key) ?? []) {
      matched.set(entry.id, entry);
    }
    for (const entry of withMatchers) {
      if (processMatchesGame(proc, entry)) {
        matched.set(entry.id, entry);
      }
    }
  }

  return [...matched.values()];
}
