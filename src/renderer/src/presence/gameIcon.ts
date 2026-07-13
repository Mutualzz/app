import type { GameCatalogEntry } from "./gameCatalog.types";
import {
  findCustomGameById,
  findCustomGameByName
} from "./customGameCatalog";
import {
  findOfficialGameById,
  findOfficialGameByName
} from "./remoteGameCatalog";
import { getGamePreference, setGameIconImageId } from "./gamePreferences";
import { CDNRoutes, type Sizes } from "@mutualzz/types";
import { REST } from "@stores/REST.store";

export type IgdbIconSize = "thumb" | "logo_med";

export function buildIgdbIconUrl(
  imageId: string,
  size: IgdbIconSize = "thumb"
) {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

const CDN_ICON_SIZES: Sizes[] = [16, 32, 64, 128, 256, 512, 1024];

function nearestIconSize(size: number): Sizes {
  return CDN_ICON_SIZES.reduce((best, candidate) =>
    Math.abs(candidate - size) < Math.abs(best - size) ? candidate : best
  );
}

function isRemoteCatalogAppId(id: string) {
  return /^\d+$/.test(id.trim());
}

export function resolveCatalogIconUrl(applicationId: string, size = 64): string {
  return REST.makeCDNUrl(
    CDNRoutes.appIcon(applicationId, nearestIconSize(size))
  );
}

export function resolveBuiltinIconUrl(entry: GameCatalogEntry, size = 64): string {
  return resolveCatalogIconUrl(entry.id, size);
}

export function resolvePlayingActivityIconUrl(
  name: string,
  size = 64,
  applicationId?: string | null
): string | null {
  const appId = applicationId?.trim();
  if (appId && isRemoteCatalogAppId(appId)) {
    return resolveCatalogIconUrl(appId, size);
  }

  if (appId) {
    const officialById = findOfficialGameById(appId);
    if (officialById) return resolveBuiltinIconUrl(officialById, size);

    const customById = findCustomGameById(appId);
    if (customById) {
      const cached = getCachedCustomIconImageId(customById.id);
      if (cached) return buildIgdbIconUrl(cached);
    }
  }

  const official = findOfficialGameByName(name);
  if (official) return resolveBuiltinIconUrl(official, size);

  const custom = findCustomGameByName(name);
  if (!custom) return null;

  const cached = getCachedCustomIconImageId(custom.id);
  if (!cached) return null;
  return buildIgdbIconUrl(cached);
}

export function getCachedCustomIconImageId(gameId: string): string | null {
  const pref = getGamePreference(gameId);
  return pref.iconImageId ?? pref.coverImageId ?? null;
}

export function cacheCustomIconImageId(gameId: string, imageId: string) {
  setGameIconImageId(gameId, imageId);
}

export function resolveGameIconUrl(
  entry: GameCatalogEntry,
  source: "builtin" | "custom"
): string | null {
  if (source === "builtin") {
    return resolveBuiltinIconUrl(entry);
  }
  const cached = getCachedCustomIconImageId(entry.id);
  if (!cached) return null;
  return buildIgdbIconUrl(cached);
}
