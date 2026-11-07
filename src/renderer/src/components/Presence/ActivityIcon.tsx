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
import {
  findCustomGameById,
  findCustomGameByName
} from "@renderer/presence/customGameCatalog";
import { PresenceIcon } from "./PresenceIcon";
import {
  AmazonLogoIcon,
  AppleLogoIcon,
  type Icon,
  SpotifyLogoIcon,
  YoutubeLogoIcon
} from "@phosphor-icons/react";

interface GameIconResponse {
  iconImageId: string;
  iconUrl: string;
}

const MEDIA_APP_ICONS: Record<string, { icon: Icon; color: string }> = {
  spotify: { icon: SpotifyLogoIcon, color: "#1DB954" },
  "apple-music": { icon: AppleLogoIcon, color: "#FA2D48" },
  "amazon-music": { icon: AmazonLogoIcon, color: "#25D1DA" },
  "youtube-music": { icon: YoutubeLogoIcon, color: "#FF0033" }
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
  }, [activity.type, assetUrl, broken, catalogUrl, cachedId, data?.iconUrl]);

  const mediaApp =
    activity.type === "listening" && activity.applicationId
      ? MEDIA_APP_ICONS[activity.applicationId]
      : undefined;

  if (url) {
    const image = (
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

    if (!mediaApp || size < 32) return image;

    const BadgeIcon = mediaApp.icon;
    const badgeSize = Math.round(size * 0.36);
    return (
      <div css={{ position: "relative", flexShrink: 0, lineHeight: 0 }}>
        {image}
        <div
          css={{
            position: "absolute",
            right: -3,
            bottom: -3,
            width: badgeSize,
            height: badgeSize,
            borderRadius: "50%",
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <BadgeIcon
            size={Math.round(badgeSize * 0.9)}
            weight="fill"
            color={mediaApp.color}
          />
        </div>
      </div>
    );
  }

  if (mediaApp) {
    const BrandIcon = mediaApp.icon;
    return (
      <BrandIcon
        size={size}
        weight="fill"
        color={mediaApp.color}
        css={{ flexShrink: 0 }}
      />
    );
  }

  return <PresenceIcon type={activity.type} color={iconColor} size={size} />;
});
