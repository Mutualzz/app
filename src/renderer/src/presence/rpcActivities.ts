import type { PresenceActivity } from "@mutualzz/types";
import { findOfficialGameById } from "./remoteGameCatalog";
import { isGameShared } from "./gamePreferences";
import { resolveRpcApplication } from "./rpcApplications";

export function resolveRpcActivityName(
  applicationId?: string | null,
  activityName?: string | null
): string {
  const named = activityName?.trim();
  if (named && named !== "Unknown Game") return named;

  const id = applicationId?.trim();
  if (id) {
    const official = findOfficialGameById(id);
    if (official?.name) return official.name;
  }

  return named || "Unknown Game";
}

export async function normalizeRpcActivities(
  raw: {
    type?: string;
    name?: string;
    applicationId?: string;
    details?: string;
    state?: string;
    url?: string;
    timestamps?: { start?: number; end?: number };
    assets?: {
      largeImageUrl?: string;
      largeText?: string;
      smallImageUrl?: string;
      smallText?: string;
    };
  }[]
): Promise<PresenceActivity[]> {
  const out: PresenceActivity[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const type = entry.type === "listening" ? "listening" : "playing";
    const applicationId = entry.applicationId?.trim() || undefined;
    if (applicationId && !isGameShared(applicationId)) continue;

    // A registered application owns its name, so a game can't pose as another
    const registered = applicationId
      ? await resolveRpcApplication(applicationId)
      : null;
    const name =
      registered?.name ?? resolveRpcActivityName(applicationId, entry.name);
    if (!name) continue;

    out.push({
      type,
      name,
      ...(applicationId ? { applicationId } : {}),
      ...(entry.details?.trim() ? { details: entry.details.trim() } : {}),
      ...(entry.state?.trim() ? { state: entry.state.trim() } : {}),
      ...(entry.url?.trim() ? { url: entry.url.trim() } : {}),
      ...(entry.timestamps ? { timestamps: entry.timestamps } : {}),
      ...(entry.assets ? { assets: entry.assets } : {})
    });
  }

  return out;
}
