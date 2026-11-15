import { ProfileBlockHandles } from "@components/Profile/editor/ProfileBlockHandles";
import { Tooltip } from "@components/Tooltip";
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
  type PixelRect,
  pixelsToPercent,
  PROFILE_GRID_STEP,
  snapRectToGrid,
  sortBlocksByZIndex,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import type {
  APIProfileBlock,
  APIProfileTheme,
  APIDisplayNameStyle,
  ProfileBackgroundImageFit,
  ProfileBlockType
} from "@mutualzz/types";
import type { AccountStore } from "@stores/Account.store";
import type { User } from "@stores/objects/User";
import type { UserProfile } from "@stores/objects/UserProfile";
import { useDroppable } from "@dnd-kit/core";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mutualzz/ui-web";
import {
  clampRectPosition,
  getBoundingRect,
  rectsIntersect,
  snapRectToGuides,
  snapResizeToGuides,
  type SnapGuide
} from "./utils/profileSnapGuides";
import {
  formatColor,
  getProfileBlockRotation,
  getProfileContentBottom,
  getProfilePageHeight,
  getRotatedBounds,
  PROFILE_CANVAS_MAX_UNITS,
  PROFILE_CANVAS_REF_WIDTH,
  PROFILE_FOLD_UNITS,
  isProfileBlockOnlyMe
} from "@mutualzz/ui-core";
import { expandSelectionToGroups } from "@components/Profile/editor/utils/profileBlockGroups.utils";

interface DragState {
  blockId: string;
  mode: "move" | "resize";
  handle?: string;
  startX: number;
  startY: number;
  origin: APIProfileBlock;
  groupOrigins: APIProfileBlock[];
  active: boolean;
}

interface MarqueeState {
  originX: number;
  originY: number;
  baseSelection: string[];
  additive: boolean;
  active: boolean;
}

const BLOCK_DRAG_THRESHOLD = 4;
const SNAP_GUIDE_THRESHOLD = 6;

interface Props {
  profile: UserProfile;
  user: User | AccountStore;
  blocks: APIProfileBlock[];
  selectedBlockIds: string[];
  onBlocksChange: (blocks: APIProfileBlock[]) => void;
  onSelectionChange: (blockIds: string[]) => void;
  backgroundColorOverride?: string | null;
  backgroundImageOverride?: string | null;
  backgroundImageFitOverride?: ProfileBackgroundImageFit | null;
  pageFontFamilyOverride?: string | null;
  themeOverride?: APIProfileTheme | null;
  displayNameStyleOverride?: APIDisplayNameStyle | null;
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
    selectedBlockIds,
    onBlocksChange,
    onSelectionChange,
    backgroundColorOverride,
    backgroundImageOverride,
    backgroundImageFitOverride,
    pageFontFamilyOverride,
    themeOverride,
    displayNameStyleOverride,
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
    const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
    const [marqueeRect, setMarqueeRect] = useState<PixelRect | null>(null);
    const marqueeLayerRef = useRef<HTMLDivElement | null>(null);
    const marqueeRef = useRef<MarqueeState | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const displayBlocksRef = useRef(blocks);
    const canvasRectRef = useRef<CanvasRect>({ width: 0, height: 0 });
    const canvasScaleRef = useRef(1);
    const isDraggingRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const pendingMoveRef = useRef<PointerEvent | null>(null);
    const snapToGridRef = useRef(snapToGrid);
    const gridStepRef = useRef(gridStep);
    const selectedBlockIdsRef = useRef(selectedBlockIds);

    snapToGridRef.current = snapToGrid;
    gridStepRef.current = gridStep;
    selectedBlockIdsRef.current = selectedBlockIds;
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

    const updateBlocks = (
      patchesById: Record<string, Partial<APIProfileBlock>>
    ) => {
      const next = displayBlocksRef.current.map((block) => {
        const patch = patchesById[block.id];
        if (!patch) return block;

        return clampBlock({
          ...block,
          ...(snapToGridRef.current
            ? snapRectToGrid({ ...block, ...patch }, gridStepRef.current)
            : patch)
        } as APIProfileBlock);
      });
      displayBlocksRef.current = next;
      setDisplayBlocks(next);
    };

    const updateBlock = (blockId: string, patch: Partial<APIProfileBlock>) =>
      updateBlocks({ [blockId]: patch });

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

    const getOtherBlockRects = (excludedBlockIds: string[]) =>
      displayBlocksRef.current
        .filter(
          (item) =>
            !isProfileBlockOnlyMe(item) && !excludedBlockIds.includes(item.id)
        )
        .map((item) =>
          getRotatedBounds(
            percentToPixels(item, canvasRectRef.current),
            getProfileBlockRotation(item)
          )
        );

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
        const canvas = canvasRectRef.current;
        const groupIds = drag.groupOrigins.map((item) => item.id);
        const originRects = drag.groupOrigins.map((item) =>
          percentToPixels(item, canvas)
        );
        const originBounds = getBoundingRect(
          originRects.map((rect, index) =>
            getRotatedBounds(
              rect,
              getProfileBlockRotation(drag.groupOrigins[index])
            )
          )
        );
        const movedBounds = {
          ...originBounds,
          left: originBounds.left + dx,
          top: originBounds.top + dy
        };

        const shouldSnapToGuides = !snapToGridRef.current && !event.altKey;
        const snapped = shouldSnapToGuides
          ? snapRectToGuides(
              movedBounds,
              getOtherBlockRects(groupIds),
              canvas,
              SNAP_GUIDE_THRESHOLD / scale
            )
          : { rect: movedBounds, guides: [] };

        setSnapGuides(snapped.guides);

        const finalBounds = clampRectPosition(snapped.rect, canvas);
        const offsetX = finalBounds.left - originBounds.left;
        const offsetY = finalBounds.top - originBounds.top;

        updateBlocks(
          Object.fromEntries(
            drag.groupOrigins.map((item, index) => [
              item.id,
              pixelsToPercent(
                {
                  ...originRects[index],
                  left: originRects[index].left + offsetX,
                  top: originRects[index].top + offsetY
                },
                canvas,
                item.type
              )
            ])
          )
        );
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

      const resizedRect = { left, top, width, height };
      const shouldSnapToGuides =
        !snapToGridRef.current && !event.altKey && !!drag.handle;
      const snapped =
        shouldSnapToGuides && drag.handle
          ? snapResizeToGuides(
              resizedRect,
              drag.handle,
              getOtherBlockRects([drag.blockId]),
              canvasRectRef.current,
              SNAP_GUIDE_THRESHOLD / scale
            )
          : { rect: resizedRect, guides: [] };

      setSnapGuides(snapped.guides);

      updateBlock(
        drag.blockId,
        pixelsToPercent(
          clampPixelRect(snapped.rect, canvasRectRef.current, block.type),
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

      const drag = dragRef.current;
      if (drag?.active) {
        onBlocksChange(displayBlocksRef.current);
      } else if (drag?.mode === "move" && drag.groupOrigins.length > 1) {
        onSelectionChange(
          expandSelectionToGroups([drag.blockId], displayBlocksRef.current)
        );
      }
      isDraggingRef.current = false;
      dragRef.current = null;
      setSnapGuides([]);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };

    const startDrag = (
      event: React.PointerEvent,
      blockId: string,
      mode: "move" | "resize",
      handle?: string
    ) => {
      if (event.button !== 0) return;

      const block = displayBlocksRef.current.find(
        (item) => item.id === blockId
      );
      if (!block || block.locked) return;

      event.currentTarget.setPointerCapture?.(event.pointerId);

      const currentSelection = selectedBlockIdsRef.current;
      const groupIds =
        mode !== "move"
          ? [blockId]
          : currentSelection.includes(blockId)
            ? currentSelection
            : expandSelectionToGroups([blockId], displayBlocksRef.current);

      dragRef.current = {
        blockId,
        mode,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        origin: { ...block },
        groupOrigins: displayBlocksRef.current.filter(
          (item) => groupIds.includes(item.id) && !item.locked
        ),
        active: mode === "resize"
      };

      if (mode === "resize") {
        isDraggingRef.current = true;
      }

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", endDrag);
    };

    const handleBlockPointerDown = (
      event: React.PointerEvent,
      blockId: string
    ) => {
      if (event.button !== 0) return;

      const currentSelection = selectedBlockIdsRef.current;
      const isSelected = currentSelection.includes(blockId);
      const memberIds = expandSelectionToGroups(
        [blockId],
        displayBlocksRef.current
      );

      if (event.shiftKey) {
        event.preventDefault();
        window.getSelection()?.removeAllRanges();
        onSelectionChange(
          isSelected
            ? currentSelection.filter(
                (selectedId) => !memberIds.includes(selectedId)
              )
            : [...new Set([...currentSelection, ...memberIds])]
        );
        return;
      }

      if (!isSelected) onSelectionChange(memberIds);
      startDrag(event, blockId, "move");
    };

    const getCanvasPoint = (event: React.PointerEvent) => {
      const layerBounds = marqueeLayerRef.current?.getBoundingClientRect();
      const scale = canvasScaleRef.current;

      return {
        x: (event.clientX - (layerBounds?.left ?? 0)) / scale,
        y: (event.clientY - (layerBounds?.top ?? 0)) / scale
      };
    };

    const handleMarqueePointerDown = (
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      const point = getCanvasPoint(event);

      marqueeRef.current = {
        originX: point.x,
        originY: point.y,
        baseSelection: event.shiftKey ? selectedBlockIdsRef.current : [],
        additive: event.shiftKey,
        active: false
      };
    };

    const handleMarqueePointerMove = (event: React.PointerEvent) => {
      const marquee = marqueeRef.current;
      if (!marquee) return;

      const point = getCanvasPoint(event);
      const rect = {
        left: Math.min(marquee.originX, point.x),
        top: Math.min(marquee.originY, point.y),
        width: Math.abs(point.x - marquee.originX),
        height: Math.abs(point.y - marquee.originY)
      };

      if (!marquee.active) {
        const distance = Math.hypot(rect.width, rect.height);
        if (distance < BLOCK_DRAG_THRESHOLD / canvasScaleRef.current) return;
        marquee.active = true;
      }

      setMarqueeRect(rect);

      const hitIds = displayBlocksRef.current
        .filter(
          (block) =>
            !isProfileBlockOnlyMe(block) &&
            rectsIntersect(
              rect,
              getRotatedBounds(
                percentToPixels(block, canvasRectRef.current),
                getProfileBlockRotation(block)
              )
            )
        )
        .map((block) => block.id);
      const nextSelection = [
        ...new Set([
          ...marquee.baseSelection,
          ...expandSelectionToGroups(hitIds, displayBlocksRef.current)
        ])
      ];

      if (nextSelection.join() !== selectedBlockIdsRef.current.join()) {
        onSelectionChange(nextSelection);
      }
    };

    const handleMarqueePointerUp = () => {
      const marquee = marqueeRef.current;
      marqueeRef.current = null;
      setMarqueeRect(null);

      if (marquee && !marquee.active && !marquee.additive) {
        onSelectionChange([]);
      }
    };

    useEffect(() => () => endDrag(), []);

    return (
      <ProfileCanvas
        ref={setNodeRef}
        profile={profile}
        interactive
        backgroundColorOverride={backgroundColorOverride}
        backgroundImageOverride={backgroundImageOverride}
        backgroundImageFitOverride={backgroundImageFitOverride}
        pageFontFamilyOverride={pageFontFamilyOverride}
        themeOverride={themeOverride}
        displayNameStyleOverride={displayNameStyleOverride}
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
                <div
                  ref={marqueeLayerRef}
                  onPointerDown={handleMarqueePointerDown}
                  onPointerMove={handleMarqueePointerMove}
                  onPointerUp={handleMarqueePointerUp}
                  onPointerCancel={handleMarqueePointerUp}
                  css={{ position: "absolute", inset: 0, zIndex: 0 }}
                />
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
                {snapGuides.map((guide) => (
                  <div
                    key={guide.axis}
                    css={{
                      position: "absolute",
                      pointerEvents: "none",
                      zIndex: theme.zIndex.modal,
                      background: theme.colors.primary,
                      ...(guide.axis === "vertical"
                        ? {
                            left: guide.position,
                            top: 0,
                            bottom: 0,
                            width: 1 / canvasScale
                          }
                        : {
                            top: guide.position,
                            left: 0,
                            right: 0,
                            height: 1 / canvasScale
                          })
                    }}
                  />
                ))}
                <ProfileFoldLine canvasScale={canvasScale} />
                {marqueeRect && (
                  <div
                    css={{
                      position: "absolute",
                      left: marqueeRect.left,
                      top: marqueeRect.top,
                      width: marqueeRect.width,
                      height: marqueeRect.height,
                      pointerEvents: "none",
                      zIndex: theme.zIndex.modal,
                      border: `${1 / canvasScale}px solid ${theme.colors.primary}`,
                      background: formatColor(theme.colors.primary, {
                        alpha: 12,
                        format: "hexa"
                      })
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
                    selected={selectedBlockIds.includes(block.id)}
                    bioOverride={bioOverride}
                    pronounsOverride={pronounsOverride}
                    bannerOverride={bannerOverride}
                    onPointerDown={(event, blockId) =>
                      handleBlockPointerDown(event, blockId)
                    }
                    onContextMenu={(event, blockId) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onBlockContextMenu?.(event, blockId);
                    }}
                    overlay={
                      selectedBlockIds.length === 1 &&
                      selectedBlockIds[0] === block.id &&
                      !block.locked && (
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

const PROFILE_EDITOR_EXTRA_ROOM = 16;

const ProfileFoldLine = ({ canvasScale }: { canvasScale: number }) => {
  const { t } = useTranslation("settings");
  const { theme } = useTheme();
  const top = (PROFILE_FOLD_UNITS / 100) * PROFILE_CANVAS_REF_WIDTH;

  return (
    <div
      aria-hidden
      css={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        pointerEvents: "none",
        zIndex: theme.zIndex.modal,
        borderTop: `${1.5 / canvasScale}px dashed ${formatColor(
          theme.colors.primary,
          { alpha: 40, format: "hexa" }
        )}`
      }}
    >
      <Tooltip content={t("profile.editor.foldLineHint")} placement="left">
        <span
          css={{
            pointerEvents: "auto",
            cursor: "help",
            opacity: 0.75,
            position: "absolute",
            right: 12 / canvasScale,
            top: 4 / canvasScale,
            padding: `${2 / canvasScale}px ${6 / canvasScale}px`,
            borderRadius: 6 / canvasScale,
            fontSize: 11 / canvasScale,
            fontWeight: 600,
            color: theme.colors.primary,
            background: formatColor(theme.colors.surface, {
              alpha: 85,
              format: "hexa"
            })
          }}
        >
          {t("profile.editor.foldLine")}
        </span>
      </Tooltip>
    </div>
  );
};

export const ProfileEditorCanvas = observer((props: Props) => {
  const { zoom = 1, ...innerProps } = props;
  const contentHeight = Math.min(
    PROFILE_CANVAS_MAX_UNITS,
    Math.max(
      getProfilePageHeight(
        props.blocks.filter((block) => !isProfileBlockOnlyMe(block))
      ),
      getProfileContentBottom(props.blocks)
    ) + PROFILE_EDITOR_EXTRA_ROOM
  );

  return (
    <ProfileCanvasViewport zoom={zoom} contentHeight={contentHeight}>
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
