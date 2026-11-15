import { ProfileActivityBlockView } from "@components/Profile/blocks/ProfileActivityBlockView";
import { ProfileConnectionsBlockView } from "@components/Profile/blocks/ProfileConnectionsBlockView";
import { ProfileDividerBlockView } from "@components/Profile/blocks/ProfileDividerBlockView";
import { ProfileHeaderBlockView } from "@components/Profile/blocks/ProfileHeaderBlockView";
import { ProfileImageBlockView } from "@components/Profile/blocks/ProfileImageBlockView";
import { ProfileLinksBlockView } from "@components/Profile/blocks/ProfileLinksBlockView";
import { ProfileMusicBlockView } from "@components/Profile/blocks/ProfileMusicBlockView";
import { ProfileMutualBlockView } from "@components/Profile/blocks/ProfileMutualBlockView";
import { ProfileQuoteBlockView } from "@components/Profile/blocks/ProfileQuoteBlockView";
import { ProfileRolesBlockView } from "@components/Profile/blocks/ProfileRolesBlockView";
import { ProfileTextBlockView } from "@components/Profile/blocks/ProfileTextBlockView";
import { ProfileDrawBlockView } from "@components/Profile/blocks/ProfileDrawBlockView";
import { ProfileStickerBlockView } from "@components/Profile/blocks/ProfileStickerBlockView";
import { ProfileCountdownBlockView } from "@components/Profile/blocks/ProfileCountdownBlockView";
import { ProfileGalleryBlockView } from "@components/Profile/blocks/ProfileGalleryBlockView";
import { ProfileEmbedBlockView } from "@components/Profile/blocks/ProfileEmbedBlockView";
import {
  getListeningActivity,
  ProfileNowPlayingBlockView
} from "@components/Profile/blocks/ProfileNowPlayingBlockView";
import {
  percentToPixels,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import type { APIProfileBlock, ProfileBlockEntrance } from "@mutualzz/types";
import {
  getProfileBlockAppearanceStyle,
  getProfileBlockRotation,
  supportsProfileBlockFont,
  supportsProfileBlockPadding,
  supportsProfileBlockTextAlign,
  resolveProfileBlockCornerRadius,
  isProfileBlockOnlyMe
} from "@mutualzz/ui-core";
import { useTheme } from "@mutualzz/ui-web";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { useGoogleFont } from "@hooks/useGoogleFont";
import { useAppStore } from "@hooks/useStores";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition
} from "motion/react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

const BlockShell = motion.create("div");

const ENTRANCE_SLIDE_DISTANCE = 24;

const ENTRANCE_START: Record<ProfileBlockEntrance, TargetAndTransition> = {
  fade: {},
  slide: { y: ENTRANCE_SLIDE_DISTANCE },
  slideDown: { y: -ENTRANCE_SLIDE_DISTANCE },
  slideLeft: { x: -ENTRANCE_SLIDE_DISTANCE },
  slideRight: { x: ENTRANCE_SLIDE_DISTANCE },
  zoom: { scale: 0.9 },
  blur: { filter: "blur(8px)" },
  flip: { rotateX: 60, transformPerspective: 800 }
};

const ENTRANCE_END: Record<ProfileBlockEntrance, TargetAndTransition> = {
  fade: {},
  slide: { y: 0 },
  slideDown: { y: 0 },
  slideLeft: { x: 0 },
  slideRight: { x: 0 },
  zoom: { scale: 1 },
  blur: { filter: "blur(0px)" },
  flip: { rotateX: 0, transformPerspective: 800 }
};
const ENTRANCE_DURATION = 0.45;
const ENTRANCE_VIEWPORT_AMOUNT = 0.2;

const INTERACTIVE_BLOCK_TYPES = new Set([
  "text",
  "header",
  "music",
  "links",
  "connections",
  "quote"
]);

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(
      'a[href], button, [role="button"], summary, [data-markdown-interactive], iframe'
    )
  );
};

interface Props {
  block: APIProfileBlock;
  canvas: CanvasRect;
  profile: UserProfile;
  user: User | AccountStore;
  selected?: boolean;
  editable?: boolean;
  overlay?: ReactNode;
  bioOverride?: string | null;
  pronounsOverride?: string | null;
  bannerOverride?: string | null;
  readOnly?: boolean;
  onSelect?: (blockId: string) => void;
  onPointerDown?: (
    event: React.PointerEvent,
    blockId: string,
    mode: "move" | "resize",
    handle?: string
  ) => void;
  onContextMenu?: (event: React.MouseEvent, blockId: string) => void;
}

export const ProfileBlockRenderer = observer(
  ({
    block,
    canvas,
    profile,
    user,
    selected,
    editable,
    overlay,
    bioOverride,
    pronounsOverride,
    bannerOverride,
    readOnly,
    onSelect,
    onPointerDown,
    onContextMenu
  }: Props) => {
    const { theme } = useTheme();
    const app = useAppStore();
    const prefersReducedMotion = useReducedMotion();
    const rect = percentToPixels(block, canvas);
    const { fontFamily: blockFontFamily } = useGoogleFont(
      supportsProfileBlockFont(block.type) ? block.appearance?.font : null,
      profile.userId
    );

    const content = (() => {
      switch (block.type) {
        case "header":
          return (
            <ProfileHeaderBlockView
              user={user}
              profile={profile}
              block={block}
              bioOverride={bioOverride}
              pronounsOverride={pronounsOverride}
              bannerOverride={bannerOverride}
            />
          );
        case "text":
          return <ProfileTextBlockView block={block} />;
        case "music":
          return <ProfileMusicBlockView block={block} profile={profile} />;
        case "image":
          return <ProfileImageBlockView block={block} profile={profile} />;
        case "links":
          return <ProfileLinksBlockView block={block} />;
        case "activity":
          return <ProfileActivityBlockView block={block} userId={user.id} />;
        case "roles":
          return <ProfileRolesBlockView block={block} userId={user.id} />;
        case "connections":
          return <ProfileConnectionsBlockView block={block} userId={user.id} />;
        case "mutual":
          return <ProfileMutualBlockView block={block} userId={user.id} />;
        case "divider":
          return <ProfileDividerBlockView block={block} />;
        case "quote":
          return <ProfileQuoteBlockView block={block} />;
        case "draw":
          return <ProfileDrawBlockView block={block} />;
        case "sticker":
          return <ProfileStickerBlockView block={block} />;
        case "countdown":
          return <ProfileCountdownBlockView block={block} />;
        case "gallery":
          return <ProfileGalleryBlockView block={block} profile={profile} />;
        case "nowPlaying":
          return <ProfileNowPlayingBlockView block={block} userId={user.id} />;
        case "embed":
          return (
            <ProfileEmbedBlockView
              block={block}
              interactive={!editable || !!readOnly}
            />
          );
        default:
          return null;
      }
    })();

    const hiddenWhileIdle =
      !!readOnly &&
      block.type === "nowPlaying" &&
      !!block.hideWhenIdle &&
      !getListeningActivity(app.presence.get(user.id));

    if (!content || hiddenWhileIdle) return null;

    const allowPointerInteraction =
      editable && !readOnly && !INTERACTIVE_BLOCK_TYPES.has(block.type);

    const cornerRadius = resolveProfileBlockCornerRadius(block, "desktop");
    const appearanceStyle = getProfileBlockAppearanceStyle(
      block.appearance,
      String(theme.colors.neutral)
    );
    const editorHiddenOpacity =
      editable && isProfileBlockOnlyMe(block) ? 0.35 : 1;
    const blockOpacity = editorHiddenOpacity * (appearanceStyle.opacity ?? 1);
    const contentPadding =
      appearanceStyle.padding != null && supportsProfileBlockPadding(block.type)
        ? appearanceStyle.padding
        : undefined;
    const rotation = getProfileBlockRotation(block);
    const entrance = block.appearance?.entrance;
    const playsEntrance =
      !!entrance &&
      !!readOnly &&
      !prefersReducedMotion &&
      !app.settings?.reducedMotion;
    const entranceProps =
      playsEntrance && entrance
        ? {
            initial: { opacity: 0, ...ENTRANCE_START[entrance] },
            whileInView: { opacity: blockOpacity, ...ENTRANCE_END[entrance] },
            viewport: { once: true, amount: ENTRANCE_VIEWPORT_AMOUNT },
            transition: {
              duration: ENTRANCE_DURATION,
              ease: "easeOut" as const
            }
          }
        : {};
    const textAlign = supportsProfileBlockTextAlign(block.type)
      ? block.appearance?.textAlign
      : undefined;
    const contentOverrides = {
      ...(appearanceStyle.glass && {
        background: "transparent",
        boxShadow: "none"
      }),
      ...(contentPadding != null && { padding: contentPadding })
    };

    return (
      <BlockShell
        {...entranceProps}
        style={rotation ? { rotate: rotation } : undefined}
        onClick={(event) => {
          if (isInteractiveTarget(event.target)) return;
          event.stopPropagation();
          if (readOnly) return;
          onSelect?.(block.id);
        }}
        onPointerDown={(event) => {
          if (!editable || readOnly) return;
          if (isInteractiveTarget(event.target)) return;
          event.stopPropagation();
          onSelect?.(block.id);
          onPointerDown?.(event, block.id, "move");
        }}
        onContextMenu={(event) => {
          if (!editable || readOnly) return;
          if (isInteractiveTarget(event.target)) return;
          onContextMenu?.(event, block.id);
        }}
        css={{
          position: "absolute",
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          zIndex: block.zIndex,
          opacity: blockOpacity < 1 ? blockOpacity : undefined,
          boxSizing: "border-box",
          border: appearanceStyle.border,
          boxShadow: appearanceStyle.boxShadow,
          backdropFilter: appearanceStyle.backdropFilter,
          textAlign,
          fontFamily: blockFontFamily,
          ...(Object.keys(contentOverrides).length > 0 && {
            "& > :first-child": contentOverrides
          }),
          cursor: editable && block.locked ? "default" : undefined,
          outline:
            !readOnly && selected
              ? `2px solid ${theme.colors.primary}`
              : undefined,
          outlineOffset: !readOnly && selected ? 2 : undefined,
          borderRadius: cornerRadius,
          overflow: "hidden",
          touchAction: allowPointerInteraction ? "none" : undefined,
          minWidth: 0
        }}
      >
        {content}
        {overlay}
      </BlockShell>
    );
  }
);
