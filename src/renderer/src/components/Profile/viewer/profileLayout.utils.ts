import type { APIProfileBlock, ProfileBlockType } from "@mutualzz/types";

export interface CanvasRect {
  width: number;
  height: number;
}

/** The fixed canvas width. Block positions are stored as % of this value. */
export const PROFILE_CANVAS_REF_WIDTH = 1600;

/** All block dimensions are expressed as % of canvas width so layout scales uniformly. */
export const canvasUnit = (canvas: CanvasRect) => canvas.width;

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ProfileBlockSizeLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  recommendedWidth: number;
  recommendedHeight: number;
}

/** Size bounds and recommended defaults (% of canvas width) per block type. */
export const PROFILE_BLOCK_SIZE_LIMITS: Record<
  ProfileBlockType,
  ProfileBlockSizeLimits
> = {
  header: {
    minWidth: 25,
    maxWidth: 100,
    minHeight: 8,
    maxHeight: 45,
    recommendedWidth: 48,
    recommendedHeight: 18
  },
  text: {
    minWidth: 10,
    maxWidth: 100,
    minHeight: 4,
    maxHeight: 55,
    recommendedWidth: 24,
    recommendedHeight: 10
  },
  image: {
    minWidth: 8,
    maxWidth: 80,
    minHeight: 8,
    maxHeight: 80,
    recommendedWidth: 18,
    recommendedHeight: 18
  },
  music: {
    minWidth: 14,
    maxWidth: 60,
    minHeight: 8,
    maxHeight: 36,
    recommendedWidth: 26,
    recommendedHeight: 10
  },
  links: {
    minWidth: 10,
    maxWidth: 72,
    minHeight: 6,
    maxHeight: 40,
    recommendedWidth: 22,
    recommendedHeight: 12
  },
  activity: {
    minWidth: 12,
    maxWidth: 64,
    minHeight: 4,
    maxHeight: 22,
    recommendedWidth: 22,
    recommendedHeight: 8
  },
  roles: {
    minWidth: 10,
    maxWidth: 72,
    minHeight: 6,
    maxHeight: 30,
    recommendedWidth: 22,
    recommendedHeight: 10
  },
  mutual: {
    minWidth: 10,
    maxWidth: 72,
    minHeight: 6,
    maxHeight: 30,
    recommendedWidth: 22,
    recommendedHeight: 10
  },
  divider: {
    minWidth: 10,
    maxWidth: 100,
    minHeight: 1,
    maxHeight: 8,
    recommendedWidth: 36,
    recommendedHeight: 2
  },
  quote: {
    minWidth: 12,
    maxWidth: 80,
    minHeight: 6,
    maxHeight: 40,
    recommendedWidth: 24,
    recommendedHeight: 12
  },
  draw: {
    minWidth: 10,
    maxWidth: 80,
    minHeight: 10,
    maxHeight: 80,
    recommendedWidth: 28,
    recommendedHeight: 28
  }
};

export const getProfileBlockSizeLimits = (type: ProfileBlockType) =>
  PROFILE_BLOCK_SIZE_LIMITS[type];

export const applyRecommendedBlockSize = (
  block: APIProfileBlock
): APIProfileBlock => {
  const limits = getProfileBlockSizeLimits(block.type);
  return clampBlock({
    ...block,
    width: limits.recommendedWidth,
    height: limits.recommendedHeight
  });
};

export const normalizeProfileBlocks = (blocks: APIProfileBlock[]) =>
  blocks.map((block) => clampBlock(block));

/** @deprecated Use per-block limits via getProfileBlockSizeLimits */
export const MIN_BLOCK_PERCENT = 4;
export const PROFILE_GRID_STEP = 4;

export const roundPercent = (value: number) =>
  Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;

export const snapPercent = (value: number, step = PROFILE_GRID_STEP) =>
  roundPercent(Math.round(value / step) * step);

export const snapRectToGrid = (
  rect: Pick<APIProfileBlock, "x" | "y" | "width" | "height">,
  step = PROFILE_GRID_STEP
) => ({
  x: snapPercent(rect.x, step),
  y: snapPercent(rect.y, step),
  width: snapPercent(rect.width, step),
  height: snapPercent(rect.height, step)
});

export const snapBlockToGrid = (block: APIProfileBlock, step = PROFILE_GRID_STEP) =>
  clampBlock({ ...block, ...snapRectToGrid(block, step) });

export const alignBlockHorizontally = (block: APIProfileBlock) =>
  clampBlock({ ...block, x: roundPercent((100 - block.width) / 2) });

export const alignBlockVertically = (block: APIProfileBlock, canvas?: CanvasRect) => {
  const canvasHeightUnits = canvas && canvas.width > 0
    ? (canvas.height / canvas.width) * 100
    : 100;
  return clampBlock({ ...block, y: roundPercent((canvasHeightUnits - block.height) / 2) });
};

export const percentToPixels = (
  block: Pick<APIProfileBlock, "x" | "y" | "width" | "height">,
  canvas: CanvasRect
): PixelRect => {
  const unit = canvasUnit(canvas);
  return {
    left: (block.x / 100) * unit,
    top: (block.y / 100) * unit,
    width: (block.width / 100) * unit,
    height: (block.height / 100) * unit
  };
};

export const pixelsToPercent = (
  rect: PixelRect,
  canvas: CanvasRect,
  blockType?: ProfileBlockType
): Pick<APIProfileBlock, "x" | "y" | "width" | "height"> => {
  const unit = canvasUnit(canvas);
  const limits = blockType ? getProfileBlockSizeLimits(blockType) : null;
  const minWidth = limits?.minWidth ?? MIN_BLOCK_PERCENT;
  const maxWidth = limits?.maxWidth ?? 100;
  const minHeight = limits?.minHeight ?? MIN_BLOCK_PERCENT;
  const maxHeight = limits?.maxHeight ?? 100;

  if (unit <= 0 || canvas.height <= 0) {
    return {
      x: 0,
      y: 0,
      width: minWidth,
      height: minHeight
    };
  }

  return {
    x: roundPercent(clamp((rect.left / unit) * 100, 0, 100)),
    y: roundPercent(clamp((rect.top / unit) * 100, 0, 100)),
    width: roundPercent(clamp((rect.width / unit) * 100, minWidth, maxWidth)),
    height: roundPercent(
      clamp((rect.height / unit) * 100, minHeight, maxHeight)
    )
  };
};

export const clampBlock = (block: APIProfileBlock): APIProfileBlock => {
  const limits = getProfileBlockSizeLimits(block.type);
  const width = roundPercent(
    clamp(block.width, limits.minWidth, limits.maxWidth)
  );
  const height = roundPercent(
    clamp(block.height, limits.minHeight, limits.maxHeight)
  );
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
  canvas: CanvasRect,
  blockType?: ProfileBlockType
): PixelRect => {
  const unit = canvasUnit(canvas);
  if (unit <= 0 || canvas.height <= 0) {
    return rect;
  }

  const limits = blockType ? getProfileBlockSizeLimits(blockType) : null;
  const minWidth = ((limits?.minWidth ?? MIN_BLOCK_PERCENT) / 100) * unit;
  const minHeight = ((limits?.minHeight ?? MIN_BLOCK_PERCENT) / 100) * unit;
  const maxWidth = ((limits?.maxWidth ?? 100) / 100) * unit;
  const maxHeight = ((limits?.maxHeight ?? 100) / 100) * unit;

  let { left, top, width, height } = rect;

  width = clamp(width, minWidth, maxWidth);
  height = clamp(height, minHeight, maxHeight);

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

  width = clamp(width, minWidth, Math.min(maxWidth, canvas.width - left));
  height = clamp(height, minHeight, Math.min(maxHeight, canvas.height - top));

  if (left + width > canvas.width) {
    left = Math.max(0, canvas.width - width);
  }
  if (top + height > canvas.height) {
    top = Math.max(0, canvas.height - height);
  }

  width = clamp(width, minWidth, Math.min(maxWidth, canvas.width - left));
  height = clamp(height, minHeight, Math.min(maxHeight, canvas.height - top));

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
  const limits = getProfileBlockSizeLimits(type);
  const size = {
    width: limits.recommendedWidth,
    height: limits.recommendedHeight
  };
  const canvasHeightUnits = canvas.width > 0
    ? (canvas.height / canvas.width) * 100
    : 100;
  const x = point
    ? clamp(
        (point.x / Math.max(canvas.width, 1)) * 100 - size.width / 2,
        0,
        100 - size.width
      )
    : 50 - size.width / 2;
  const y = point
    ? clamp(
        (point.y / Math.max(canvasUnit(canvas), 1)) * 100 - size.height / 2,
        0,
        canvasHeightUnits - size.height
      )
    : type === "header"
      ? 2
      : clamp(canvasHeightUnits / 2 - size.height / 2, 0, canvasHeightUnits - size.height);

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
      return clampBlock({ ...base, type: "text", content: "New text" });
    case "image":
      return clampBlock({
        ...base,
        type: "image",
        src: "",
        objectFit: "cover"
      });
    case "header":
      return clampBlock({
        ...base,
        type: "header",
        bannerHeight: 58,
        bannerFocusY: 50
      });
    case "music":
      return clampBlock({
        ...base,
        type: "music",
        title: "Favorite song",
        artists: null,
        image: null,
        previewUrl: null,
        trackUrl: null,
        track: null
      });
    case "links":
      return clampBlock({
        ...base,
        type: "links",
        links: [{ label: "My link", url: "https://example.com" }]
      });
    case "activity":
      return clampBlock({ ...base, type: "activity", showCustomStatus: true });
    case "roles":
      return clampBlock({ ...base, type: "roles", maxRoles: 6 });
    case "mutual":
      return clampBlock({
        ...base,
        type: "mutual",
        mode: "spaces",
        maxItems: 6
      });
    case "divider":
      return clampBlock({ ...base, type: "divider", style: "line" });
    case "quote":
      return clampBlock({
        ...base,
        type: "quote",
        content: "Write a quote…",
        variant: "default",
        attribution: null
      });
    case "draw":
      return clampBlock({
        ...base,
        type: "draw",
        svgData: null,
        paths: null,
        backgroundColor: null
      });
  }
};
