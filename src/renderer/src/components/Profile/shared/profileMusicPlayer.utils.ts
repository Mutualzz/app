import type { APIProfileMusic } from "@mutualzz/types";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import type { UserProfile } from "@stores/objects/UserProfile";
import i18n from "@renderer/i18n";
import type { AppStore } from "@stores/App.store";

const AUDIO_HASH_PATTERN = /^[a-f0-9_]+$/i;

export const isProfileMusicAudioHash = (value: string) =>
  AUDIO_HASH_PATTERN.test(value);

export const getProfileMusicLabel = (music: APIProfileMusic) => {
  if (music.title) return music.title;
  if (music.audioHash)
    return i18n.t("profile.music.uploadedTrack", { ns: "settings" });
  try {
    return new URL(music.url).hostname.replace(/^www\./, "");
  } catch {
    return i18n.t("profile.music.fallbackTitle", { ns: "settings" });
  }
};

export const isUploadedProfileMusic = (music: APIProfileMusic) =>
  !!music.audioHash;

export const hasPreviewProfileMusic = (music: APIProfileMusic) =>
  !!music.previewUrl || !!music.audioHash || !!music.musicTrack;

export const getHiddenEmbedPlaybackUrl = (
  music: APIProfileMusic
): string | null => {
  if (music.audioHash) return null;

  if (music.youtube) {
    const base = music.youtube.embedUrl;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}autoplay=1`;
  }

  if (music.apple) {
    const base = music.apple.embedUrl;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}autoplay=1`;
  }

  return null;
};

export const getProfileMusicPlaybackUrl = (
  profile: UserProfile,
  music: APIProfileMusic
) => {
  if (music.audioHash) {
    return profile.constructProfileMusicAudioUrl(music.audioHash);
  }

  if (music.previewUrl) {
    return music.previewUrl;
  }

  return null;
};

export const resolveFreshTrackPreviewUrl = async (
  app: AppStore,
  source: "itunes" | "deezer",
  id: string
) => {
  const data = await app.rest.get<{ previewUrl: string }>(
    "/@me/profile/music/preview",
    { source, id }
  );
  return data.previewUrl;
};

export const resolveProfileMusicPlaybackUrl = async (
  app: AppStore,
  profile: UserProfile,
  music: APIProfileMusic
) => {
  if (music.audioHash) {
    return profile.constructProfileMusicAudioUrl(music.audioHash);
  }

  if (music.musicTrack) {
    try {
      return await resolveFreshTrackPreviewUrl(
        app,
        music.musicTrack.source,
        music.musicTrack.id
      );
    } catch {
      return music.previewUrl ?? null;
    }
  }

  return music.previewUrl ?? null;
};

export const canPlayProfileMusic = (
  profile: UserProfile,
  music: APIProfileMusic
) =>
  !!getProfileMusicPlaybackUrl(profile, music) ||
  !!music.musicTrack ||
  !!getHiddenEmbedPlaybackUrl(music);

export const getDraftProfileMusic = (
  draft: ProfileDraftState,
  profile: UserProfile
): APIProfileMusic | null => {
  if (draft.profileMusicTrackId && draft.profileMusicTrackSelection) {
    const track = draft.profileMusicTrackSelection;
    return {
      url: track.trackUrl,
      title: track.name,
      image: track.image,
      authorName: track.artists,
      previewUrl: track.previewUrl,
      musicTrack: {
        source: track.source,
        id: track.id
      }
    };
  }

  if (!draft.profileMusicUrl && !draft.profileMusicTrackId) return null;

  const ref = draft.profileMusicUrl;
  const fallbackTitle = i18n.t("profile.music.fallbackTitle", {
    ns: "settings"
  });

  if (ref && isProfileMusicAudioHash(ref)) {
    return {
      url: ref,
      audioHash: ref,
      title: profile.profileMusic?.audioHash === ref
        ? profile.profileMusic.title ?? fallbackTitle
        : fallbackTitle
    };
  }

  if (
    draft.profileMusicTrackId &&
    (profile.profileMusic?.musicTrack?.id === draft.profileMusicTrackId ||
      profile.profileMusic?.spotify?.id === draft.profileMusicTrackId)
  ) {
    return profile.profileMusic;
  }

  if (ref && profile.profileMusic?.url === ref) {
    return profile.profileMusic;
  }

  if (ref) {
    return { url: ref, title: fallbackTitle };
  }

  return null;
};
