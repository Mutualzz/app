import type {
  APIProfileBlock,
  APIProfileMusicSearchTrack,
  APIProfileTheme,
  APIDisplayNameStyle,
  APIUserProfileSnapshot,
  ProfileBackgroundImageFit
} from "@mutualzz/types";
import { normalizeProfileBlocks } from "@components/Profile/viewer/profileLayout.utils";
import { removeSingleMemberGroups } from "@components/Profile/editor/utils/profileBlockGroups.utils";
import i18n from "@renderer/i18n";
import { type Theme } from "@stores/objects/Theme";

export interface ProfileDraftState {
  bio: string;
  pronouns: string;
  banner: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  backgroundImageFit: ProfileBackgroundImageFit | null;
  pageFontFamily: string | null;
  theme: APIProfileTheme | null;
  displayNameStyle: APIDisplayNameStyle | null;
  profileMusicUrl: string | null;
  profileMusicTrackId: string | null;
  profileMusicTrackSource: "itunes" | "deezer" | null;
  profileMusicTrackSelection: APIProfileMusicSearchTrack | null;
  profileMusicTitle: string | null;
  profileMusicAuthorName: string | null;
  blocks: APIProfileBlock[];
}

export type ProfileDraftSource = Omit<APIUserProfileSnapshot, "mobileBlocks">;

const migrateLegacyHiddenBlock = (block: APIProfileBlock): APIProfileBlock =>
  block.hidden ? { ...block, hidden: undefined, visibility: "nobody" } : block;

export const createDraftFromProfile = (
  profile: ProfileDraftSource
): ProfileDraftState => {
  const musicTrackId =
    profile.profileMusic?.musicTrack?.id ??
    (profile.profileMusic?.spotify?.type === "track"
      ? profile.profileMusic.spotify.id
      : null);

  const musicTrackSource = profile.profileMusic?.musicTrack?.source ?? null;

  return {
    bio: profile.bio ?? "",
    pronouns: profile.pronouns ?? "",
    banner: profile.banner ?? null,
    backgroundColor: profile.backgroundColor ?? null,
    backgroundImage: profile.backgroundImage ?? null,
    backgroundImageFit: profile.backgroundImageFit ?? null,
    pageFontFamily: profile.pageFontFamily ?? null,
    theme: profile.theme ?? null,
    displayNameStyle: profile.displayNameStyle ?? null,
    profileMusicTrackId: musicTrackId,
    profileMusicTrackSource: musicTrackId
      ? (musicTrackSource ?? "itunes")
      : null,
    profileMusicTrackSelection:
      musicTrackId && profile.profileMusic
        ? {
            source: musicTrackSource ?? "itunes",
            id: musicTrackId,
            name:
              profile.profileMusic.title ??
              i18n.t("profile.inspector.profileMusic", { ns: "settings" }),
            artists: profile.profileMusic.authorName ?? "",
            image: profile.profileMusic.image ?? null,
            previewUrl: profile.profileMusic.previewUrl ?? null,
            trackUrl: profile.profileMusic.url
          }
        : null,
    profileMusicUrl:
      profile.profileMusic?.audioHash ??
      (profile.profileMusic?.musicTrack || profile.profileMusic?.spotify
        ? null
        : (profile.profileMusic?.url ?? null)),
    profileMusicTitle: profile.profileMusic?.audioHash
      ? (profile.profileMusic.title ?? null)
      : null,
    profileMusicAuthorName: profile.profileMusic?.audioHash
      ? (profile.profileMusic.authorName ?? null)
      : null,
    blocks: normalizeProfileBlocks(
      (profile.blocks ?? []).filter(
        (block) =>
          (block as { type: string }).type !== "embed" ||
          !!(block as { kind?: string }).kind
      )
    ).map(migrateLegacyHiddenBlock)
  };
};

export const createEmptyDraft = (): ProfileDraftState => ({
  bio: "",
  pronouns: "",
  banner: null,
  backgroundColor: null,
  backgroundImage: null,
  backgroundImageFit: null,
  pageFontFamily: null,
  theme: null,
  displayNameStyle: null,
  profileMusicUrl: null,
  profileMusicTrackId: null,
  profileMusicTrackSource: null,
  profileMusicTrackSelection: null,
  profileMusicTitle: null,
  profileMusicAuthorName: null,
  blocks: []
});

export const createProfileThemeSnapshot = (theme: Theme): APIProfileTheme => ({
  sourceId: theme.id,
  name: theme.name,
  type: theme.type,
  style: theme.style,
  colors: JSON.parse(JSON.stringify(theme.colors)),
  typographyColors: JSON.parse(JSON.stringify(theme.typography.colors))
});

export const hasProfileDraftContent = (draft: ProfileDraftState) =>
  draft.blocks.length > 0 ||
  !!draft.bio.trim() ||
  !!draft.pronouns.trim() ||
  !!draft.banner ||
  !!draft.backgroundColor ||
  !!draft.backgroundImage ||
  !!draft.theme ||
  !!draft.displayNameStyle ||
  !!draft.profileMusicUrl ||
  !!draft.profileMusicTrackId;

export const EMPTY_PROFILE_SAVE_PAYLOAD = {
  bio: null,
  pronouns: null,
  banner: null,
  backgroundColor: null,
  backgroundImage: null,
  backgroundImageFit: null,
  theme: null,
  displayNameStyle: null,
  profileMusicUrl: null,
  profileMusicTrackId: null,
  profileMusicTrackSource: null,
  blocks: [] as APIProfileBlock[]
};

export const prepareBlocksForSave = (blocks: APIProfileBlock[]) =>
  removeSingleMemberGroups(
    normalizeProfileBlocks(blocks).filter((block) => {
      if ((block as { type: string }).type === "embed") return false;
      if (block.type === "image" && !block.src.trim()) return false;
      if (block.type === "sticker" && !block.expressionId.trim()) return false;
      if (
        block.type === "links" &&
        block.links.every((link) => !link.url.trim())
      ) {
        return false;
      }
      return true;
    })
  );

export const validateDraftForSave = (
  draft: ProfileDraftState
): string | null => {
  const emptyImages = draft.blocks.filter(
    (block) => block.type === "image" && !block.src.trim()
  ).length;
  const emptyStickers = draft.blocks.filter(
    (block) => block.type === "sticker" && !block.expressionId.trim()
  ).length;
  const emptyLinks = draft.blocks.filter(
    (block) =>
      block.type === "links" &&
      block.links.every((link) => !link.url.trim() || !link.label.trim())
  ).length;

  if (emptyImages > 0) {
    return i18n.t("profile.inspector.validation.emptyImages", {
      count: emptyImages,
      ns: "settings"
    });
  }

  if (emptyStickers > 0) {
    return i18n.t("profile.inspector.validation.emptyStickers", {
      count: emptyStickers,
      ns: "settings"
    });
  }

  if (emptyLinks > 0) {
    return i18n.t("profile.inspector.validation.emptyLinks", {
      count: emptyLinks,
      ns: "settings"
    });
  }

  if (draft.bio.length > 512) {
    return i18n.t("profile.inspector.validation.bioTooLong", {
      ns: "settings"
    });
  }

  if (draft.pronouns.length > 32) {
    return i18n.t("profile.inspector.validation.pronounsTooLong", {
      ns: "settings"
    });
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

const isPrimaryModifier = (event: KeyboardEvent) =>
  (event.ctrlKey || event.metaKey) && !event.altKey;

export const isProfileUndoKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && !event.shiftKey && event.code === "KeyZ";

export const isProfileRedoKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) &&
  ((event.shiftKey && event.code === "KeyZ") ||
    (!event.shiftKey && event.code === "KeyY"));

export const isProfileCopyKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && !event.shiftKey && event.code === "KeyC";

export const isProfilePasteKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && !event.shiftKey && event.code === "KeyV";

export const isProfileDuplicateKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && !event.shiftKey && event.code === "KeyD";

export const isProfileGroupKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && !event.shiftKey && event.code === "KeyG";

export const isProfileUngroupKey = (event: KeyboardEvent) =>
  isPrimaryModifier(event) && event.shiftKey && event.code === "KeyG";

const NUDGE_DIRECTIONS: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

export const getNudgeDirection = (event: KeyboardEvent) =>
  event.ctrlKey || event.metaKey || event.altKey
    ? null
    : (NUDGE_DIRECTIONS[event.key] ?? null);

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
  x: (translatedRect.left - canvasRect.left + translatedRect.width / 2) / scale,
  y: (translatedRect.top - canvasRect.top + translatedRect.height / 2) / scale
});
