import { getBoundingRect } from "./profileSnapGuides";
import { remapGroupIds } from "./profileBlockGroups.utils";
import {
  clamp,
  nextZIndex,
  percentToPixels,
  pixelsToPercent,
  roundPercent,
  type CanvasRect,
  type PixelRect
} from "@mutualzz/ui-core";
import type { APIProfileBlock } from "@mutualzz/types";

export type BlockAlignment =
  | "left"
  | "center"
  | "right"
  | "top"
  | "middle"
  | "bottom";

export type BlockDistribution = "horizontal" | "vertical";

const getAlignedRect = (
  rect: PixelRect,
  bounds: PixelRect,
  alignment: BlockAlignment
): PixelRect => {
  switch (alignment) {
    case "left":
      return { ...rect, left: bounds.left };
    case "center":
      return { ...rect, left: bounds.left + (bounds.width - rect.width) / 2 };
    case "right":
      return { ...rect, left: bounds.left + bounds.width - rect.width };
    case "top":
      return { ...rect, top: bounds.top };
    case "middle":
      return { ...rect, top: bounds.top + (bounds.height - rect.height) / 2 };
    case "bottom":
      return { ...rect, top: bounds.top + bounds.height - rect.height };
  }
};

const applyRects = (
  blocks: APIProfileBlock[],
  rectsById: Map<string, PixelRect>,
  canvas: CanvasRect
) =>
  blocks.map((block) => {
    const rect = rectsById.get(block.id);
    if (!rect || block.locked) return block;
    return {
      ...block,
      ...pixelsToPercent(rect, canvas, block.type)
    } as APIProfileBlock;
  });

interface ArrangeUnit {
  members: APIProfileBlock[];
  rect: PixelRect;
}

const getArrangeUnits = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[],
  canvas: CanvasRect
): ArrangeUnit[] => {
  const selectedBlocks = blocks.filter((block) =>
    selectedBlockIds.includes(block.id)
  );
  const membersByKey = new Map<string, APIProfileBlock[]>();
  for (const block of selectedBlocks) {
    const key = block.groupId ?? block.id;
    membersByKey.set(key, [...(membersByKey.get(key) ?? []), block]);
  }

  const groupedUnits = [...membersByKey.values()];
  const units =
    groupedUnits.length < 2
      ? selectedBlocks.map((block) => [block])
      : groupedUnits;

  return units.map((members) => ({
    members,
    rect: getBoundingRect(
      members.map((member) => percentToPixels(member, canvas))
    )
  }));
};

const moveUnit = (
  unit: ArrangeUnit,
  target: PixelRect,
  canvas: CanvasRect,
  rectsById: Map<string, PixelRect>
) => {
  const deltaLeft = target.left - unit.rect.left;
  const deltaTop = target.top - unit.rect.top;

  for (const member of unit.members) {
    const memberRect = percentToPixels(member, canvas);
    rectsById.set(member.id, {
      ...memberRect,
      left: memberRect.left + deltaLeft,
      top: memberRect.top + deltaTop
    });
  }
};

export const alignBlocks = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[],
  alignment: BlockAlignment,
  canvas: CanvasRect
) => {
  const units = getArrangeUnits(blocks, selectedBlockIds, canvas);
  if (units.length < 2) return blocks;

  const bounds = getBoundingRect(units.map((unit) => unit.rect));
  const rectsById = new Map<string, PixelRect>();

  for (const unit of units) {
    moveUnit(
      unit,
      getAlignedRect(unit.rect, bounds, alignment),
      canvas,
      rectsById
    );
  }

  return applyRects(blocks, rectsById, canvas);
};

export const distributeBlocks = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[],
  distribution: BlockDistribution,
  canvas: CanvasRect
) => {
  const isHorizontal = distribution === "horizontal";
  const units = getArrangeUnits(blocks, selectedBlockIds, canvas).sort(
    (first, second) =>
      isHorizontal
        ? first.rect.left - second.rect.left
        : first.rect.top - second.rect.top
  );
  if (units.length < 3) return blocks;

  const getSize = (rect: PixelRect) =>
    isHorizontal ? rect.width : rect.height;
  const bounds = getBoundingRect(units.map((unit) => unit.rect));
  const totalSize = units.reduce((sum, unit) => sum + getSize(unit.rect), 0);
  const gap = (getSize(bounds) - totalSize) / (units.length - 1);

  const rectsById = new Map<string, PixelRect>();
  let cursor = isHorizontal ? bounds.left : bounds.top;

  for (const unit of units) {
    moveUnit(
      unit,
      isHorizontal
        ? { ...unit.rect, left: cursor }
        : { ...unit.rect, top: cursor },
      canvas,
      rectsById
    );
    cursor += getSize(unit.rect) + gap;
  }

  return applyRects(blocks, rectsById, canvas);
};

export const MAX_PROFILE_BLOCKS = 100;
const COPY_OFFSET_PERCENT = 2;

export const nudgeBlocks = (
  blocks: APIProfileBlock[],
  selectedBlockIds: string[],
  deltaX: number,
  deltaY: number
) => {
  const movableBlocks = blocks.filter(
    (block) => selectedBlockIds.includes(block.id) && !block.locked
  );
  if (movableBlocks.length === 0) return blocks;

  const minX = Math.min(...movableBlocks.map((block) => block.x));
  const minY = Math.min(...movableBlocks.map((block) => block.y));
  const maxRight = Math.max(
    ...movableBlocks.map((block) => block.x + block.width)
  );
  const maxBottom = Math.max(
    ...movableBlocks.map((block) => block.y + block.height)
  );

  const allowedX = clamp(deltaX, -minX, 100 - maxRight);
  const allowedY = clamp(deltaY, -minY, 100 - maxBottom);
  if (allowedX === 0 && allowedY === 0) return blocks;

  return blocks.map((block) =>
    movableBlocks.includes(block)
      ? {
          ...block,
          x: roundPercent(block.x + allowedX),
          y: roundPercent(block.y + allowedY)
        }
      : block
  );
};

export const createBlockCopies = (
  blocks: APIProfileBlock[],
  sourceBlocks: APIProfileBlock[]
) => {
  const capacity = MAX_PROFILE_BLOCKS - blocks.length;
  const baseZIndex = nextZIndex(blocks);

  const copies = [...sourceBlocks]
    .sort((first, second) => first.zIndex - second.zIndex)
    .slice(0, Math.max(0, capacity))
    .map((block, index) => ({
      ...(JSON.parse(JSON.stringify(block)) as APIProfileBlock),
      id: crypto.randomUUID(),
      x: roundPercent(
        Math.min(block.x + COPY_OFFSET_PERCENT, 100 - block.width)
      ),
      y: roundPercent(
        Math.min(block.y + COPY_OFFSET_PERCENT, 100 - block.height)
      ),
      zIndex: baseZIndex + index,
      locked: false
    }));

  return remapGroupIds(copies);
};
