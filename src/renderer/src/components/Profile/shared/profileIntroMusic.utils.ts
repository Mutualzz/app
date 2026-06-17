import type { APIProfileIntroMusic } from "@mutualzz/types";
import type { ProfileDraftState } from "@components/Profile/editor/profileEditor.utils";
import type { UserProfile } from "@stores/objects/UserProfile";

const AUDIO_HASH_PATTERN = /^[a-f0-9_]+$/i;

export const isIntroMusicAudioHash = (value: string) =>
  AUDIO_HASH_PATTERN.test(value);

export const getIntroMusicLabel = (introMusic: APIProfileIntroMusic) => {
  if (introMusic.title) return introMusic.title;
  if (introMusic.audioHash) return "Uploaded track";
  try {
    return new URL(introMusic.url).hostname.replace(/^www\./, "");
  } catch {
    return "Intro music";
  }
};

export const isUploadedIntroMusic = (introMusic: APIProfileIntroMusic) =>
  !!introMusic.audioHash;

export const hasPreviewIntroMusic = (introMusic: APIProfileIntroMusic) =>
  !!introMusic.previewUrl || !!introMusic.audioHash;

export const getHiddenEmbedPlaybackUrl = (
  introMusic: APIProfileIntroMusic
): string | null => {
  if (introMusic.previewUrl || introMusic.audioHash) return null;

  if (introMusic.youtube) {
    const base = introMusic.youtube.embedUrl;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}autoplay=1`;
  }

  if (introMusic.apple) {
    const base = introMusic.apple.embedUrl;
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}autoplay=1`;
  }

  return null;
};

export const getIntroMusicPlaybackUrl = (
  profile: UserProfile,
  introMusic: APIProfileIntroMusic
) => {
  if (introMusic.audioHash) {
    return profile.constructIntroMusicAudioUrl(introMusic.audioHash);
  }

  if (introMusic.previewUrl) {
    return introMusic.previewUrl;
  }

  return null;
};

export const canPlayIntroMusic = (
  profile: UserProfile,
  introMusic: APIProfileIntroMusic
) =>
  !!getIntroMusicPlaybackUrl(profile, introMusic) ||
  !!getHiddenEmbedPlaybackUrl(introMusic);

export const getDraftIntroMusic = (
  draft: ProfileDraftState,
  profile: UserProfile
): APIProfileIntroMusic | null => {
  if (draft.introMusicTrackId && draft.introMusicTrackSelection) {
    const track = draft.introMusicTrackSelection;
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

  if (!draft.introMusicUrl && !draft.introMusicTrackId) return null;

  const ref = draft.introMusicUrl;
  if (ref && isIntroMusicAudioHash(ref)) {
    return {
      url: ref,
      audioHash: ref,
      title: profile.introMusic?.audioHash === ref
        ? profile.introMusic.title ?? "Intro music"
        : "Intro music"
    };
  }

  if (
    draft.introMusicTrackId &&
    (profile.introMusic?.musicTrack?.id === draft.introMusicTrackId ||
      profile.introMusic?.spotify?.id === draft.introMusicTrackId)
  ) {
    return profile.introMusic;
  }

  if (ref && profile.introMusic?.url === ref) {
    return profile.introMusic;
  }

  if (ref) {
    return { url: ref, title: "Intro music" };
  }

  return null;
};
