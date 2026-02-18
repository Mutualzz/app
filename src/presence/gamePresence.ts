import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@utils/index.ts";
import type { PresenceActivity, PresenceStatus } from "@mutualzz/types";

interface RunningProcess {
    pid: number;
    name: string;
}

interface GameCatalogEntry {
    exe: string;
    name: string;
}

// NOTE: This is a hardcoded catalog of games that we want to support presence for. In the future, we could expand this to be user-configurable, or even query the Windows registry for installed games.
const GAME_CATALOG: GameCatalogEntry[] = [
    { exe: "cs2.exe", name: "Counter-Strike 2" },
    { exe: "valorant.exe", name: "VALORANT" },
    { exe: "minecraft.exe", name: "Minecraft" },
    { exe: "warframe.x64.exe", name: "Warframe" },
];

function matchGame(processNames: string[]): GameCatalogEntry | null {
    const lowerSet = new Set(
        processNames.map((processName) => processName.toLowerCase()),
    );
    for (const entry of GAME_CATALOG) {
        if (lowerSet.has(entry.exe)) return entry;
    }
    return null;
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
        processes = (await invoke("list_processes")) as RunningProcess[];
    } catch {
        return { status: "online", device: "desktop", activities: [] };
    }

    const processNames = processes.map((proc) => proc.name);
    const game = matchGame(processNames);

    if (!game) return { status: "online", device: "desktop", activities: [] };

    return {
        status: "online",
        device: "desktop",
        activities: [
            {
                type: "playing",
                name: game.name,
                timestamps: { start: Date.now() },
            },
        ],
    };
}
