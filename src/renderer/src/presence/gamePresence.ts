import type { PresenceActivity, PresenceStatus } from "@mutualzz/types";
import {
  findMatchingProcess,
  getCatalogExeFilter,
  matchGamesFromProcesses
} from "./gameCatalog";
import { isGameShared, touchGamePlayed } from "./gamePreferences";

export type { GameCatalogEntry, CustomGameCatalogEntry } from "./gameCatalog";
export {
  getGameCatalog,
  getOfficialGameCatalog,
  addCustomGame,
  removeCustomGame,
  renameCustomGame,
  listCustomGames,
  ensureRemoteGameCatalog,
  BUILTIN_GAME_CATALOG,
  FALLBACK_GAME_CATALOG
} from "./gameCatalog";

export interface PresenceUpdateDraft {
  status: PresenceStatus;
  device: "desktop" | "web" | "mobile";
  activities: PresenceActivity[];
}

export async function buildDesktopPresenceFromProcesses(): Promise<PresenceUpdateDraft> {
  if (!window.api) return { status: "online", device: "web", activities: [] };

  try {
    const gameExes = getCatalogExeFilter();
    if (!gameExes.length) {
      return { status: "online", device: "desktop", activities: [] };
    }

    const processes = await window.api.system.listProcesses(gameExes);
    const matched = matchGamesFromProcesses(processes);
    if (matched.length) {
      touchGamePlayed(
        matched.map((game) => {
          const proc = findMatchingProcess(game, processes);
          return {
            id: game.id,
            exePath: proc?.path ?? null
          };
        })
      );
    }

    const games = matched.filter((game) => isGameShared(game.id));

    if (!games.length) {
      return { status: "online", device: "desktop", activities: [] };
    }

    return {
      status: "online",
      device: "desktop",
      activities: games.map((game) => ({
        type: "playing" as const,
        name: game.name,
        applicationId: game.id
      }))
    };
  } catch {
    return { status: "online", device: "desktop", activities: [] };
  }
}
