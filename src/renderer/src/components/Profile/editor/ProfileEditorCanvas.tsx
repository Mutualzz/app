import { ProfileBlockHandles } from "@components/Profile/editor/ProfileBlockHandles";
import { ProfileBlockRenderer } from "@components/Profile/viewer/ProfileBlockRenderer";
import { ProfileCanvas } from "@components/Profile/shared/ProfileCanvas";
import {
  clampBlock,
  clampPixelRect,
  createDefaultBlock,
  nextZIndex,
  percentToPixels,
  pixelsToPercent,
  sortBlocksByZIndex,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import { useProfileCanvasRect } from "@components/Profile/shared/useProfileCanvasRect";
import type { APIProfileBlock, ProfileBlockType } from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { useDroppable } from "@dnd-kit/core";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";

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
  bioOverride?: string | null;
  bannerOverride?: string | null;
  onCanvasRectChange?: (rect: CanvasRect) => void;
}

export const ProfileEditorCanvas = observer(
  ({
    profile,
    user,
    blocks,
    selectedBlockId,
    onBlocksChange,
    onSelectBlock,
    backgroundColorOverride,
    backgroundImageOverride,
    bioOverride,
    bannerOverride,
    onCanvasRectChange
  }: Props) => {
    const {
      canvasRef: measureCanvasRef,
      canvasRect,
      isCanvasReady
    } = useProfileCanvasRect(onCanvasRectChange);
    const [displayBlocks, setDisplayBlocks] = useState(blocks);
    const dragRef = useRef<DragState | null>(null);
    const displayBlocksRef = useRef(blocks);
    const canvasRectRef = useRef<CanvasRect>({ width: 800, height: 600 });
    const isDraggingRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const pendingMoveRef = useRef<PointerEvent | null>(null);

    displayBlocksRef.current = displayBlocks;
    if (canvasRect) {
      canvasRectRef.current = canvasRect;
    }

    useEffect(() => {
      if (!isDraggingRef.current) {
        setDisplayBlocks(blocks);
      }
    }, [blocks]);

    const { setNodeRef, isOver } = useDroppable({
      id: "profile-editor-canvas",
      data: { target: "canvas" }
    });

    const setDroppableRef = useRef(setNodeRef);
    setDroppableRef.current = setNodeRef;

    const canvasContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        measureCanvasRef(node);
        setDroppableRef.current(node);
      },
      [measureCanvasRef]
    );

    const updateBlock = (blockId: string, patch: Partial<APIProfileBlock>) => {
      const next = displayBlocksRef.current.map((block) =>
        block.id === blockId
          ? clampBlock({ ...block, ...patch } as APIProfileBlock)
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

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
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
            canvasRectRef.current
          ),
          canvasRectRef.current
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
          clampPixelRect({ left, top, width, height }, canvasRectRef.current),
          canvasRectRef.current
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
        ref={canvasContainerRef}
        profile={profile}
        interactive
        backgroundColorOverride={backgroundColorOverride}
        backgroundImageOverride={backgroundImageOverride}
        onCanvasClick={() => onSelectBlock(null)}
      >
        {isOver && (
          <div
            css={{
              position: "absolute",
              inset: 0,
              border: "2px dashed rgba(99,102,241,0.8)",
              pointerEvents: "none",
              zIndex: 9999
            }}
          />
        )}
        {isCanvasReady &&
          canvasRect &&
          sortBlocksByZIndex(displayBlocks).map((block) => (
            <ProfileBlockRenderer
              key={block.id}
              block={block}
              canvas={canvasRect}
              profile={profile}
              user={user}
              editable
              selected={selectedBlockId === block.id}
              bioOverride={bioOverride}
              bannerOverride={bannerOverride}
              onSelect={(blockId) => onSelectBlock(blockId)}
              onPointerDown={(event, blockId, mode, handle) =>
                startDrag(event, blockId, mode, handle)
              }
              overlay={
                selectedBlockId === block.id ? (
                  <ProfileBlockHandles
                    onPointerDown={(event, handle) =>
                      startDrag(event, block.id, "resize", handle)
                    }
                  />
                ) : null
              }
            />
          ))}
      </ProfileCanvas>
    );
  }
);

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
