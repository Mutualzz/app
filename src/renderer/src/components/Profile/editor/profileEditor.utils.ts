import type {
  APIProfileBlock,
  APIProfileMusicSearchTrack
} from "@mutualzz/types";
import type { UserProfile } from "@stores/objects/UserProfile";
import { normalizeProfileBlocks } from "@components/Profile/viewer/profileLayout.utils";

export interface ProfileDraftState {
  bio: string;
  banner: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  pageFontFamily: string | null;
  introMusicUrl: string | null;
  introMusicTrackId: string | null;
  introMusicTrackSource: "itunes" | "deezer" | null;
  introMusicTrackSelection: APIProfileMusicSearchTrack | null;
  introMusicTitle: string | null;
  introMusicAuthorName: string | null;
  blocks: APIProfileBlock[];
}

export const createDraftFromProfile = (
  profile: UserProfile
): ProfileDraftState => {
  const musicTrackId =
    profile.introMusic?.musicTrack?.id ??
    (profile.introMusic?.spotify?.type === "track"
      ? profile.introMusic.spotify.id
      : null);

  const musicTrackSource = profile.introMusic?.musicTrack?.source ?? null;

  return {
    bio: profile.bio ?? "",
    banner: profile.banner ?? null,
    backgroundColor: profile.backgroundColor ?? null,
    backgroundImage: profile.backgroundImage ?? null,
    pageFontFamily: profile.pageFontFamily ?? null,
    introMusicTrackId: musicTrackId,
    introMusicTrackSource: musicTrackId ? (musicTrackSource ?? "itunes") : null,
    introMusicTrackSelection:
      musicTrackId && profile.introMusic
        ? {
            source: musicTrackSource ?? "itunes",
            id: musicTrackId,
            name: profile.introMusic.title ?? "Intro music",
            artists: profile.introMusic.authorName ?? "",
            image: profile.introMusic.image ?? null,
            previewUrl: profile.introMusic.previewUrl ?? null,
            trackUrl: profile.introMusic.url
          }
        : null,
    introMusicUrl:
      profile.introMusic?.audioHash ??
      (profile.introMusic?.musicTrack || profile.introMusic?.spotify
        ? null
        : (profile.introMusic?.url ?? null)),
    introMusicTitle: profile.introMusic?.audioHash
      ? (profile.introMusic.title ?? null)
      : null,
    introMusicAuthorName: profile.introMusic?.audioHash
      ? (profile.introMusic.authorName ?? null)
      : null,
    blocks: normalizeProfileBlocks(
      (profile.blocks ?? []).filter(
        (block) => (block as { type: string }).type !== "embed"
      ) as APIProfileBlock[]
    )
  };
};

export const createEmptyDraft = (): ProfileDraftState => ({
  bio: "",
  banner: null,
  backgroundColor: null,
  backgroundImage: null,
  pageFontFamily: null,
  introMusicUrl: null,
  introMusicTrackId: null,
  introMusicTrackSource: null,
  introMusicTrackSelection: null,
  introMusicTitle: null,
  introMusicAuthorName: null,
  blocks: []
});

export const hasProfileDraftContent = (draft: ProfileDraftState) =>
  draft.blocks.length > 0 ||
  !!draft.bio.trim() ||
  !!draft.banner ||
  !!draft.backgroundColor ||
  !!draft.backgroundImage ||
  !!draft.introMusicUrl ||
  !!draft.introMusicTrackId;

export const EMPTY_PROFILE_SAVE_PAYLOAD = {
  bio: null,
  banner: null,
  backgroundColor: null,
  backgroundImage: null,
  introMusicUrl: null,
  introMusicTrackId: null,
  introMusicTrackSource: null,
  blocks: [] as APIProfileBlock[]
};

export const prepareBlocksForSave = (blocks: APIProfileBlock[]) =>
  normalizeProfileBlocks(blocks).filter((block) => {
    if ((block as { type: string }).type === "embed") return false;
    if (block.type === "image" && !block.src.trim()) return false;
    if (block.type === "links" && block.links.every((l) => !l.url.trim())) {
      return false;
    }
    return true;
  });

export const validateDraftForSave = (
  draft: ProfileDraftState
): string | null => {
  const emptyImages = draft.blocks.filter(
    (block) => block.type === "image" && !block.src.trim()
  ).length;
  const emptyLinks = draft.blocks.filter(
    (block) =>
      block.type === "links" &&
      block.links.every((link) => !link.url.trim() || !link.label.trim())
  ).length;

  if (emptyImages > 0) {
    return `Remove or upload images for ${emptyImages} image block${
      emptyImages === 1 ? "" : "s"
    } before saving`;
  }

  if (emptyLinks > 0) {
    return `Add at least one link to ${emptyLinks} links block${
      emptyLinks === 1 ? "" : "s"
    } before saving`;
  }

  if (draft.bio.length > 512) {
    return "Bio must be at most 512 characters";
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const apiError = error as {
      message?: unknown;
      errors?: { message?: string }[];
    };

    if (apiError.errors?.[0]?.message) {
      return apiError.errors[0].message;
    }

    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
  }
  return fallback;
};

export const isEditableInputFocused = () => {
  const target = document.activeElement;
  if (!target || !(target instanceof HTMLElement)) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export const isProfileBlockDeleteKey = (event: KeyboardEvent) =>
  (event.key === "Delete" || event.key === "Backspace") &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.altKey;

export const getDropPoint = (
  translatedRect: { left: number; top: number; width: number; height: number },
  canvasRect: { left: number; top: number },
  scale = 1
) => ({
  x:
    (translatedRect.left - canvasRect.left + translatedRect.width / 2) / scale,
  y: (translatedRect.top - canvasRect.top + translatedRect.height / 2) / scale
});
