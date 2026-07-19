import { ProfileBlockHandles } from "@components/Profile/editor/ProfileBlockHandles";
import { ProfileBlockRenderer } from "@components/Profile/viewer/ProfileBlockRenderer";
import { ProfileCanvas } from "@components/Profile/shared/ProfileCanvas";
import { ProfileCanvasBlocksLayer } from "@components/Profile/shared/ProfileCanvasBlocksLayer";
import { ProfileCanvasRectReporter } from "@components/Profile/shared/ProfileCanvasBlocksLayer";
import { ProfileCanvasViewport } from "@components/Profile/shared/ProfileCanvasViewport";
import {
  clampBlock,
  clampPixelRect,
  createDefaultBlock,
  nextZIndex,
  percentToPixels,
  pixelsToPercent,
  PROFILE_GRID_STEP,
  snapRectToGrid,
  sortBlocksByZIndex,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import type { APIProfileBlock, ProfileBlockType } from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { useDroppable } from "@dnd-kit/core";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@mutualzz/ui-web";

type DragState = {
  blockId: string;
  mode: "move" | "resize";
  handle?: string;
  startX: number;
  startY: number;
  origin: APIProfileBlock;
  active: boolean;
};

const BLOCK_DRAG_THRESHOLD = 4;

interface Props {
  profile: UserProfile;
  user: User | AccountStore;
  blocks: APIProfileBlock[];
  selectedBlockId: string | null;
  onBlocksChange: (blocks: APIProfileBlock[]) => void;
  onSelectBlock: (blockId: string | null) => void;
  backgroundColorOverride?: string | null;
  backgroundImageOverride?: string | null;
  pageFontFamilyOverride?: string | null;
  bioOverride?: string | null;
  pronounsOverride?: string | null;
  bannerOverride?: string | null;
  onCanvasRectChange?: (rect: CanvasRect) => void;
  onViewportScaleChange?: (scale: number) => void;
  snapToGrid?: boolean;
  gridStep?: number;
  zoom?: number;
  onBlockContextMenu?: (event: React.MouseEvent, blockId: string) => void;
}

const ProfileEditorCanvasInner = observer(
  ({
    profile,
    user,
    blocks,
    selectedBlockId,
    onBlocksChange,
    onSelectBlock,
    backgroundColorOverride,
    backgroundImageOverride,
    pageFontFamilyOverride,
    bioOverride,
    pronounsOverride,
    bannerOverride,
    onCanvasRectChange,
    onViewportScaleChange,
    snapToGrid = false,
    gridStep = PROFILE_GRID_STEP,
    onBlockContextMenu
  }: Omit<Props, "zoom">) => {
    const { theme } = useTheme();
    const [displayBlocks, setDisplayBlocks] = useState(blocks);
    const dragRef = useRef<DragState | null>(null);
    const displayBlocksRef = useRef(blocks);
    const canvasRectRef = useRef<CanvasRect>({ width: 0, height: 0 });
    const canvasScaleRef = useRef(1);
    const isDraggingRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const pendingMoveRef = useRef<PointerEvent | null>(null);
    const snapToGridRef = useRef(snapToGrid);
    const gridStepRef = useRef(gridStep);

    snapToGridRef.current = snapToGrid;
    gridStepRef.current = gridStep;
    displayBlocksRef.current = displayBlocks;

    useEffect(() => {
      if (!isDraggingRef.current) {
        setDisplayBlocks(blocks);
      }
    }, [blocks]);

    const { setNodeRef, isOver } = useDroppable({
      id: "profile-editor-canvas",
      data: { target: "canvas" }
    });

    const updateBlock = (blockId: string, patch: Partial<APIProfileBlock>) => {
      const next = displayBlocksRef.current.map((block) =>
        block.id === blockId
          ? clampBlock({
              ...block,
              ...(snapToGridRef.current
                ? snapRectToGrid({ ...block, ...patch }, gridStepRef.current)
                : patch)
            } as APIProfileBlock)
          : block
      );
      displayBlocksRef.current = next;
      setDisplayBlocks(next);
    };

    const onPointerMove = (event: PointerEvent) => {
      pendingMoveRef.current = event;
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const moveEvent = pendingMoveRef.current;
        pendingMoveRef.current = null;
        if (!moveEvent) return;
        applyPointerMove(moveEvent);
      });
    };

    const applyPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (!drag.active) {
        const distance = Math.hypot(
          event.clientX - drag.startX,
          event.clientY - drag.startY
        );
        if (distance < BLOCK_DRAG_THRESHOLD) return;
        drag.active = true;
        isDraggingRef.current = true;
      }

      const block = displayBlocksRef.current.find(
        (item) => item.id === drag.blockId
      );
      if (!block) return;

      const scale = canvasScaleRef.current;
      const dx = (event.clientX - drag.startX) / scale;
      const dy = (event.clientY - drag.startY) / scale;
      const originRect = percentToPixels(drag.origin, canvasRectRef.current);

      if (drag.mode === "move") {
        const next = pixelsToPercent(
          clampPixelRect(
            {
              left: originRect.left + dx,
              top: originRect.top + dy,
              width: originRect.width,
              height: originRect.height
            },
            canvasRectRef.current,
            block.type
          ),
          canvasRectRef.current,
          block.type
        );
        updateBlock(drag.blockId, next);
        return;
      }

      let { left, top, width, height } = originRect;

      switch (drag.handle) {
        case "nw":
          left += dx;
          top += dy;
          width -= dx;
          height -= dy;
          break;
        case "n":
          top += dy;
          height -= dy;
          break;
        case "ne":
          top += dy;
          width += dx;
          height -= dy;
          break;
        case "e":
          width += dx;
          break;
        case "se":
          width += dx;
          height += dy;
          break;
        case "s":
          height += dy;
          break;
        case "sw":
          left += dx;
          width -= dx;
          height += dy;
          break;
        case "w":
          left += dx;
          width -= dx;
          break;
      }

      updateBlock(
        drag.blockId,
        pixelsToPercent(
          clampPixelRect(
            { left, top, width, height },
            canvasRectRef.current,
            block.type
          ),
          canvasRectRef.current,
          block.type
        )
      );
    };

    const endDrag = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pendingMoveRef.current = null;

      if (dragRef.current?.active) {
        onBlocksChange(displayBlocksRef.current);
      }
      isDraggingRef.current = false;
      dragRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };

    const startDrag = (
      event: React.PointerEvent,
      blockId: string,
      mode: "move" | "resize",
      handle?: string
    ) => {
      const block = displayBlocksRef.current.find(
        (item) => item.id === blockId
      );
      if (!block) return;

      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragRef.current = {
        blockId,
        mode,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        origin: { ...block },
        active: mode === "resize"
      };

      if (mode === "resize") {
        isDraggingRef.current = true;
      }

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
    };

    useEffect(() => () => endDrag(), []);

    return (
      <ProfileCanvas
        ref={setNodeRef}
        profile={profile}
        interactive
        backgroundColorOverride={backgroundColorOverride}
        backgroundImageOverride={backgroundImageOverride}
        pageFontFamilyOverride={pageFontFamilyOverride}
        onCanvasClick={() => onSelectBlock(null)}
      >
        <ProfileCanvasRectReporter
          onCanvasRectChange={onCanvasRectChange}
          onViewportScaleChange={onViewportScaleChange}
        />
        <ProfileCanvasBlocksLayer>
          {({ canvasRect, canvasScale }) => {
            canvasRectRef.current = canvasRect;
            canvasScaleRef.current = canvasScale;

            return (
              <>
                {snapToGrid && (
                  <div
                    css={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 0,
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
                      `,
                      backgroundSize: `${(gridStep / 100) * canvasRect.width}px ${(gridStep / 100) * canvasRect.width}px`
                    }}
                  />
                )}
                {isOver && (
                  <div
                    css={{
                      position: "absolute",
                      inset: 0,
                      border: "2px dashed rgba(99,102,241,0.8)",
                      pointerEvents: "none",
                      zIndex: theme.zIndex.modal
                    }}
                  />
                )}
                {sortBlocksByZIndex(displayBlocks).map((block) => (
                  <ProfileBlockRenderer
                    key={block.id}
                    block={block}
                    canvas={canvasRect}
                    profile={profile}
                    user={user}
                    editable
                    selected={selectedBlockId === block.id}
                    bioOverride={bioOverride}
                    pronounsOverride={pronounsOverride}
                    bannerOverride={bannerOverride}
                    onSelect={(blockId) => onSelectBlock(blockId)}
                    onPointerDown={(event, blockId, mode, handle) =>
                      startDrag(event, blockId, mode, handle)
                    }
                    onContextMenu={(event, blockId) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onBlockContextMenu?.(event, blockId);
                    }}
                    overlay={
                      selectedBlockId === block.id && (
                        <ProfileBlockHandles
                          onPointerDown={(event, handle) =>
                            startDrag(event, block.id, "resize", handle)
                          }
                        />
                      )
                    }
                  />
                ))}
              </>
            );
          }}
        </ProfileCanvasBlocksLayer>
      </ProfileCanvas>
    );
  }
);

export const ProfileEditorCanvas = observer((props: Props) => {
  const { zoom = 1, ...innerProps } = props;

  return (
    <ProfileCanvasViewport zoom={zoom}>
      <ProfileEditorCanvasInner {...innerProps} />
    </ProfileCanvasViewport>
  );
});

export const addBlockAtPoint = (
  blocks: APIProfileBlock[],
  type: ProfileBlockType,
  canvas: CanvasRect,
  point?: { x: number; y: number }
) => [
  ...blocks,
  {
    ...createDefaultBlock(type, canvas, point),
    zIndex: nextZIndex(blocks)
  }
];
