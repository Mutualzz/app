import type { APIProfileBlock, ProfileBlockType } from "@mutualzz/types";

export interface CanvasRect {
  width: number;
  height: number;
}

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const MIN_BLOCK_PERCENT = 4;

export const roundPercent = (value: number) =>
  Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;

export const percentToPixels = (
  block: Pick<APIProfileBlock, "x" | "y" | "width" | "height">,
  canvas: CanvasRect
): PixelRect => ({
  left: (block.x / 100) * canvas.width,
  top: (block.y / 100) * canvas.height,
  width: (block.width / 100) * canvas.width,
  height: (block.height / 100) * canvas.height
});

export const pixelsToPercent = (
  rect: PixelRect,
  canvas: CanvasRect
): Pick<APIProfileBlock, "x" | "y" | "width" | "height"> => {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return { x: 0, y: 0, width: MIN_BLOCK_PERCENT, height: MIN_BLOCK_PERCENT };
  }

  return {
    x: roundPercent(clamp((rect.left / canvas.width) * 100, 0, 100)),
    y: roundPercent(clamp((rect.top / canvas.height) * 100, 0, 100)),
    width: roundPercent(
      clamp((rect.width / canvas.width) * 100, MIN_BLOCK_PERCENT, 100)
    ),
    height: roundPercent(
      clamp((rect.height / canvas.height) * 100, MIN_BLOCK_PERCENT, 100)
    )
  };
};

export const clampBlock = (block: APIProfileBlock): APIProfileBlock => {
  const width = roundPercent(clamp(block.width, MIN_BLOCK_PERCENT, 100));
  const height = roundPercent(clamp(block.height, MIN_BLOCK_PERCENT, 100));
  const maxX = Math.max(0, 100 - width);
  const maxY = Math.max(0, 100 - height);
  const x = roundPercent(clamp(block.x, 0, maxX));
  const y = roundPercent(clamp(block.y, 0, maxY));

  return {
    ...block,
    x,
    y,
    width: roundPercent(Math.min(width, 100 - x)),
    height: roundPercent(Math.min(height, 100 - y))
  };
};

export const clampPixelRect = (
  rect: PixelRect,
  canvas: CanvasRect
): PixelRect => {
  if (canvas.width <= 0 || canvas.height <= 0) {
    return rect;
  }

  const minWidth = (MIN_BLOCK_PERCENT / 100) * canvas.width;
  const minHeight = (MIN_BLOCK_PERCENT / 100) * canvas.height;

  let { left, top, width, height } = rect;

  width = Math.max(minWidth, width);
  height = Math.max(minHeight, height);

  if (left < 0) {
    width += left;
    left = 0;
  }
  if (top < 0) {
    height += top;
    top = 0;
  }

  if (left + width > canvas.width) {
    width = canvas.width - left;
  }
  if (top + height > canvas.height) {
    height = canvas.height - top;
  }

  width = Math.max(minWidth, width);
  height = Math.max(minHeight, height);

  if (left + width > canvas.width) {
    left = Math.max(0, canvas.width - width);
  }
  if (top + height > canvas.height) {
    top = Math.max(0, canvas.height - height);
  }

  return { left, top, width, height };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const sortBlocksByZIndex = (blocks: APIProfileBlock[]) =>
  [...blocks].sort((a, b) => a.zIndex - b.zIndex);

export const nextZIndex = (blocks: APIProfileBlock[]) =>
  blocks.reduce((max, block) => Math.max(max, block.zIndex), 0) + 1;

export const createDefaultBlock = (
  type: ProfileBlockType,
  canvas: CanvasRect,
  point?: { x: number; y: number }
): APIProfileBlock => {
  const defaults: Record<ProfileBlockType, { width: number; height: number }> =
    {
      header: { width: 96, height: 30 },
      text: { width: 30, height: 12 },
      image: { width: 24, height: 24 },
      music: { width: 26, height: 18 },
      links: { width: 28, height: 16 },
      activity: { width: 30, height: 10 },
      roles: { width: 28, height: 14 },
      mutual: { width: 28, height: 14 },
      divider: { width: 50, height: 4 },
      quote: { width: 32, height: 14 }
    };

  const size = defaults[type];
  const x = point
    ? clamp(
        (point.x / Math.max(canvas.width, 1)) * 100 - size.width / 2,
        0,
        100 - size.width
      )
    : 50 - size.width / 2;
  const y = point
    ? clamp(
        (point.y / Math.max(canvas.height, 1)) * 100 - size.height / 2,
        0,
        100 - size.height
      )
    : type === "header"
      ? 2
      : 50 - size.height / 2;

  const base = {
    id: crypto.randomUUID(),
    x: roundPercent(x),
    y: roundPercent(y),
    width: roundPercent(size.width),
    height: roundPercent(size.height),
    zIndex: 1
  };

  switch (type) {
    case "text":
      return { ...base, type: "text", content: "New text" };
    case "image":
      return { ...base, type: "image", src: "", objectFit: "cover" };
    case "header":
      return { ...base, type: "header", bannerHeight: 58, bannerFocusY: 50 };
    case "music":
      return {
        ...base,
        type: "music",
        title: "Favorite song",
        artists: null,
        image: null,
        previewUrl: null,
        trackUrl: null,
        track: null
      };
    case "links":
      return {
        ...base,
        type: "links",
        links: [{ label: "My link", url: "https://example.com" }]
      };
    case "activity":
      return { ...base, type: "activity", showCustomStatus: true };
    case "roles":
      return { ...base, type: "roles", maxRoles: 6 };
    case "mutual":
      return { ...base, type: "mutual", mode: "spaces", maxItems: 6 };
    case "divider":
      return { ...base, type: "divider", style: "line" };
    case "quote":
      return {
        ...base,
        type: "quote",
        content: "Write a quote…",
        variant: "default",
        attribution: null
      };
  }
};
