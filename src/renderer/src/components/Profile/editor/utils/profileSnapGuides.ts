import type { CanvasRect, PixelRect } from "@mutualzz/ui-core";

export interface SnapGuide {
  axis: "vertical" | "horizontal";
  position: number;
}

interface AxisSnap {
  offset: number;
  position: number;
}

const getVerticalLines = (rect: PixelRect) => [
  rect.left,
  rect.left + rect.width / 2,
  rect.left + rect.width
];

const getHorizontalLines = (rect: PixelRect) => [
  rect.top,
  rect.top + rect.height / 2,
  rect.top + rect.height
];

const findClosestSnap = (
  anchors: number[],
  targets: number[],
  threshold: number
): AxisSnap | null => {
  let closest: AxisSnap | null = null;

  for (const anchor of anchors) {
    for (const target of targets) {
      const offset = target - anchor;
      if (Math.abs(offset) > threshold) continue;
      if (!closest || Math.abs(offset) < Math.abs(closest.offset)) {
        closest = { offset, position: target };
      }
    }
  }

  return closest;
};

const getTargetRects = (canvas: CanvasRect, otherRects: PixelRect[]) => [
  { left: 0, top: 0, width: canvas.width, height: canvas.height },
  ...otherRects
];

export const snapRectToGuides = (
  rect: PixelRect,
  otherRects: PixelRect[],
  canvas: CanvasRect,
  threshold: number
) => {
  const targetRects = getTargetRects(canvas, otherRects);

  const verticalSnap = findClosestSnap(
    getVerticalLines(rect),
    targetRects.flatMap(getVerticalLines),
    threshold
  );
  const horizontalSnap = findClosestSnap(
    getHorizontalLines(rect),
    targetRects.flatMap(getHorizontalLines),
    threshold
  );

  const guides: SnapGuide[] = [];
  if (verticalSnap) {
    guides.push({ axis: "vertical", position: verticalSnap.position });
  }
  if (horizontalSnap) {
    guides.push({ axis: "horizontal", position: horizontalSnap.position });
  }

  return {
    rect: {
      ...rect,
      left: rect.left + (verticalSnap?.offset ?? 0),
      top: rect.top + (horizontalSnap?.offset ?? 0)
    },
    guides
  };
};

export const snapResizeToGuides = (
  rect: PixelRect,
  handle: string,
  otherRects: PixelRect[],
  canvas: CanvasRect,
  threshold: number
) => {
  const targetRects = getTargetRects(canvas, otherRects);
  const verticalTargets = targetRects.flatMap(getVerticalLines);
  const horizontalTargets = targetRects.flatMap(getHorizontalLines);
  const guides: SnapGuide[] = [];
  let { left, top, width, height } = rect;

  if (handle.includes("w")) {
    const snap = findClosestSnap([left], verticalTargets, threshold);
    if (snap) {
      left += snap.offset;
      width -= snap.offset;
      guides.push({ axis: "vertical", position: snap.position });
    }
  } else if (handle.includes("e")) {
    const snap = findClosestSnap([left + width], verticalTargets, threshold);
    if (snap) {
      width += snap.offset;
      guides.push({ axis: "vertical", position: snap.position });
    }
  }

  if (handle.includes("n")) {
    const snap = findClosestSnap([top], horizontalTargets, threshold);
    if (snap) {
      top += snap.offset;
      height -= snap.offset;
      guides.push({ axis: "horizontal", position: snap.position });
    }
  } else if (handle.includes("s")) {
    const snap = findClosestSnap([top + height], horizontalTargets, threshold);
    if (snap) {
      height += snap.offset;
      guides.push({ axis: "horizontal", position: snap.position });
    }
  }

  return { rect: { left, top, width, height }, guides };
};

export const getBoundingRect = (rects: PixelRect[]): PixelRect => {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));

  return { left, top, width: right - left, height: bottom - top };
};

export const clampRectPosition = (
  rect: PixelRect,
  canvas: CanvasRect
): PixelRect => ({
  ...rect,
  left: Math.min(
    Math.max(rect.left, 0),
    Math.max(0, canvas.width - rect.width)
  ),
  top: Math.min(Math.max(rect.top, 0), Math.max(0, canvas.height - rect.height))
});

export const rectsIntersect = (first: PixelRect, second: PixelRect) =>
  first.left < second.left + second.width &&
  first.left + first.width > second.left &&
  first.top < second.top + second.height &&
  first.top + first.height > second.top;
