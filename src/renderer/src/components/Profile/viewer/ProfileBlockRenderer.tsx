import { ProfileActivityBlockView } from "@components/Profile/blocks/ProfileActivityBlockView";
import { ProfileDividerBlockView } from "@components/Profile/blocks/ProfileDividerBlockView";
import { ProfileHeaderBlockView } from "@components/Profile/blocks/ProfileHeaderBlockView";
import { ProfileImageBlockView } from "@components/Profile/blocks/ProfileImageBlockView";
import { ProfileLinksBlockView } from "@components/Profile/blocks/ProfileLinksBlockView";
import { ProfileMusicBlockView } from "@components/Profile/blocks/ProfileMusicBlockView";
import { ProfileMutualBlockView } from "@components/Profile/blocks/ProfileMutualBlockView";
import { ProfileQuoteBlockView } from "@components/Profile/blocks/ProfileQuoteBlockView";
import { ProfileRolesBlockView } from "@components/Profile/blocks/ProfileRolesBlockView";
import { ProfileTextBlockView } from "@components/Profile/blocks/ProfileTextBlockView";
import {
  percentToPixels,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import type { APIProfileBlock } from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { motion } from "motion/react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

const BlockShell = motion.create("div");

const INTERACTIVE_BLOCK_TYPES = new Set([
  "text",
  "header",
  "music",
  "links",
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
    bannerOverride,
    readOnly,
    onSelect,
    onPointerDown,
    onContextMenu
  }: Props) => {
    const rect = percentToPixels(block, canvas);

    const content = (() => {
      switch (block.type) {
        case "header":
          return (
            <ProfileHeaderBlockView
              user={user}
              profile={profile}
              block={block}
              bioOverride={bioOverride}
              bannerOverride={bannerOverride}
            />
          );
        case "text":
          return <ProfileTextBlockView block={block} />;
        case "music":
          return <ProfileMusicBlockView block={block} />;
        case "image":
          return <ProfileImageBlockView block={block} profile={profile} />;
        case "links":
          return <ProfileLinksBlockView block={block} />;
        case "activity":
          return <ProfileActivityBlockView block={block} userId={user.id} />;
        case "roles":
          return <ProfileRolesBlockView block={block} userId={user.id} />;
        case "mutual":
          return <ProfileMutualBlockView block={block} userId={user.id} />;
        case "divider":
          return <ProfileDividerBlockView block={block} />;
        case "quote":
          return <ProfileQuoteBlockView block={block} />;
        default:
          return null;
      }
    })();

    if (!content) return null;

    const allowPointerInteraction =
      editable && !readOnly && !INTERACTIVE_BLOCK_TYPES.has(block.type);

    return (
      <BlockShell
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
          outline:
            !readOnly && selected
              ? "2px solid var(--joy-palette-primary-500, #6366f1)"
              : undefined,
          outlineOffset: !readOnly && selected ? 2 : undefined,
          borderRadius: block.type === "divider" ? 0 : 8,
          touchAction: allowPointerInteraction ? "none" : undefined
        }}
      >
        {content}
        {overlay}
      </BlockShell>
    );
  }
);
