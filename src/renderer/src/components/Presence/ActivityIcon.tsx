import { useAppStore } from "@hooks/useStores";
import type { PresenceActivity } from "@mutualzz/types";
import { useTheme } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import {
  buildIgdbIconUrl,
  cacheCustomIconImageId,
  getCachedCustomIconImageId,
  resolvePlayingActivityIconUrl
} from "@renderer/presence/gameIcon";
import { findCustomGameById, findCustomGameByName } from "@renderer/presence/customGameCatalog";
import { PresenceIcon } from "./PresenceIcon";

type GameIconResponse = {
  iconImageId: string;
  iconUrl: string;
};

export const ActivityIcon = observer(function ActivityIcon({
  activity,
  size = 16,
  color,
  fetchFallback = false,
  borderRadius = 4
}: {
  activity: PresenceActivity;
  size?: number;
  color?: string;
  fetchFallback?: boolean;
  borderRadius?: number;
}) {
  const app = useAppStore();
  const { theme } = useTheme();
  const [broken, setBroken] = useState(false);
  const iconColor = color ?? theme.colors.success;

  const customGame = useMemo(() => {
    if (activity.type !== "playing") return null;
    if (activity.applicationId) {
      return findCustomGameById(activity.applicationId);
    }
    return findCustomGameByName(activity.name);
  }, [activity.applicationId, activity.name, activity.type]);
  const [cachedId, setCachedId] = useState(() =>
    customGame ? getCachedCustomIconImageId(customGame.id) : null
  );

  const assetUrl = useMemo(() => {
    if (broken) return null;
    return activity.assets?.largeImageUrl?.trim() || null;
  }, [activity.assets?.largeImageUrl, broken]);

  const catalogUrl = useMemo(() => {
    if (assetUrl || activity.type !== "playing" || broken) return null;
    return resolvePlayingActivityIconUrl(
      activity.name,
      Math.max(size, 32),
      activity.applicationId
    );
  }, [
    activity.applicationId,
    activity.name,
    activity.type,
    assetUrl,
    broken,
    size
  ]);

  const { data } = useQuery({
    queryKey: ["activity-icon", activity.applicationId ?? activity.name],
    enabled:
      fetchFallback &&
      activity.type === "playing" &&
      !assetUrl &&
      !catalogUrl &&
      !cachedId &&
      !broken,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    queryFn: async () => {
      try {
        return await app.rest.get<GameIconResponse>("/games/icon", {
          q: activity.name
        });
      } catch {
        return null;
      }
    }
  });

  useEffect(() => {
    if (!data?.iconImageId || !customGame || cachedId) return;
    cacheCustomIconImageId(customGame.id, data.iconImageId);
    setCachedId(data.iconImageId);
  }, [cachedId, customGame, data?.iconImageId]);

  const url = useMemo(() => {
    if (broken) return null;
    if (assetUrl) return assetUrl;
    if (activity.type !== "playing") return null;
    if (catalogUrl) return catalogUrl;
    if (cachedId) return buildIgdbIconUrl(cachedId);
    return data?.iconUrl ?? null;
  }, [
    activity.type,
    assetUrl,
    broken,
    catalogUrl,
    cachedId,
    data?.iconUrl
  ]);

  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        onError={() => setBroken(true)}
        css={{
          width: size,
          height: size,
          borderRadius,
          objectFit: "cover",
          flexShrink: 0,
          display: "block"
        }}
      />
    );
  }

  return <PresenceIcon type={activity.type} color={iconColor} size={size} />;
});
