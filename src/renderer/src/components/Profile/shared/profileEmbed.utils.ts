import {
  resolveProfileUrl,
  type ProfileEmbedProvider
} from "@components/Profile/shared/profileLink.utils";
import type { ProfileEmbedKind } from "@mutualzz/types";

const KIND_PROVIDERS: Partial<Record<ProfileEmbedKind, ProfileEmbedProvider>> =
  {
    youtube: "youtube",
    spotify: "spotify",
    appleMusic: "apple",
    soundcloud: "soundcloud"
  };

export const getEmbedKindForUrl = (url: string): ProfileEmbedKind | null => {
  const resolved = resolveProfileUrl(url);
  if (!resolved?.embedProvider) return null;

  const match = Object.entries(KIND_PROVIDERS).find(
    ([, provider]) => provider === resolved.embedProvider
  );
  return match ? (match[0] as ProfileEmbedKind) : null;
};

export const getIframeEmbedUrl = (
  kind: ProfileEmbedKind,
  url: string | null | undefined
) => {
  if (!url) return null;
  const expectedProvider = KIND_PROVIDERS[kind];
  if (!expectedProvider) return null;

  const resolved = resolveProfileUrl(url);
  if (resolved?.embedProvider !== expectedProvider) return null;
  return resolved.embedUrl ?? null;
};
