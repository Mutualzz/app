import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@utils/index.ts";
import type { PresenceActivity, PresenceStatus } from "@mutualzz/types";

interface RunningProcess {
    pid: number;
    name: string;
}

interface GameCatalogEntry {
    exes: string[];
    name: string;
    id: string;
}

// NOTE: This is a hardcoded catalog of games that we want to support presence for. In the future, we could expand this to be user-configurable or even query the Windows registry for installed games.
// 2nd NOTE: we will eventually move them later
const GAME_CATALOG: GameCatalogEntry[] = [
    { exes: ["cs2.exe"], name: "Counter-Strike 2", id: "counter-strike-2" },
    { exes: ["valorant.exe"], name: "VALORANT", id: "valorant" },
    {
        exes: ["minecraft.exe", "minecraftlauncher.exe"],
        name: "Minecraft",
        id: "minecraft",
    },
    {
        exes: ["warframe.x64.exe", "warframe.exe"],
        name: "Warframe",
        id: "warframe",
    },
];

function matchGames(processNames: string[]): GameCatalogEntry[] {
    const lowerSet = new Set(processNames.map((p) => p.toLowerCase()));
    return GAME_CATALOG.filter((entry) =>
        entry.exes.some((exe) => lowerSet.has(exe)),
    );
}

export interface PresenceUpdateDraft {
    status: PresenceStatus;
    device: "desktop" | "web" | "mobile";
    activities: PresenceActivity[];
}

export async function buildDesktopPresenceFromProcesses(): Promise<PresenceUpdateDraft> {
    if (!isTauri) return { status: "online", device: "web", activities: [] };

    let processes: RunningProcess[] = [];
    try {
        const gameExes = GAME_CATALOG.flatMap((g) => g.exes);

        processes = (await invoke("list_processes", {
            filterExes: gameExes,
        })) as RunningProcess[];
    } catch {
        return { status: "online", device: "desktop", activities: [] };
    }

    const processNames = processes.map((proc) => proc.name);
    const games = matchGames(processNames);

    if (!games.length)
        return { status: "online", device: "desktop", activities: [] };

    return {
        status: "online",
        device: "desktop",
        activities: games.map((game) => ({
            type: "playing",
            name: game.name,
        })),
    };
}
