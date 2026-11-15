import type { APIProfileBlock, ProfileBlockType } from "@mutualzz/types";
import {
  type CanvasRect,
  canvasUnit,
  clampBlock,
  getProfileBlockSizeLimits,
  PROFILE_COUNTDOWN_DEFAULT_DAYS,
  roundPercent
} from "@mutualzz/ui-core";
import i18n from "@renderer/i18n";
import dayjs from "dayjs";

export {
  type CanvasRect,
  type PixelRect,
  type ProfileBlockSizeLimits,
  PROFILE_CANVAS_REF_WIDTH,
  canvasUnit,
  percentToPixels,
  pixelsToPercent,
  PROFILE_BLOCK_SIZE_LIMITS,
  getProfileBlockSizeLimits,
  MIN_BLOCK_PERCENT,
  PROFILE_GRID_STEP,
  roundPercent,
  snapPercent,
  snapRectToGrid,
  clampBlock,
  snapBlockToGrid,
  alignBlockHorizontally,
  alignBlockVertically,
  applyRecommendedBlockSize,
  normalizeProfileBlocks,
  clampPixelRect,
  sortBlocksByZIndex,
  nextZIndex
} from "@mutualzz/ui-core";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const canvasHeightUnits =
    canvas.width > 0 ? (canvas.height / canvas.width) * 100 : 100;
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
      : clamp(
          canvasHeightUnits / 2 - size.height / 2,
          0,
          canvasHeightUnits - size.height
        );

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
      return clampBlock({
        ...base,
        type: "text",
        content: i18n.t("profile.widgets.defaults.text", { ns: "settings" })
      });
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
        title: i18n.t("profile.widgets.defaults.musicTitle", {
          ns: "settings"
        }),
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
        links: [
          {
            label: i18n.t("profile.widgets.defaults.linkLabel", {
              ns: "settings"
            }),
            url: "https://example.com"
          }
        ]
      });
    case "activity":
      return clampBlock({ ...base, type: "activity", showCustomStatus: true });
    case "roles":
      return clampBlock({ ...base, type: "roles", maxRoles: 6 });
    case "connections":
      return clampBlock({ ...base, type: "connections" });
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
        content: i18n.t("profile.widgets.defaults.quoteContent", {
          ns: "settings"
        }),
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
    case "sticker":
      return clampBlock({
        ...base,
        type: "sticker",
        expressionId: ""
      });
    case "nowPlaying":
      return clampBlock({ ...base, type: "nowPlaying" });
    case "embed":
      return clampBlock({ ...base, type: "embed", kind: "youtube", url: null });
    case "gallery":
      return clampBlock({
        ...base,
        type: "gallery",
        images: [],
        layout: "grid"
      });
    case "countdown":
      return clampBlock({
        ...base,
        type: "countdown",
        targetAt: dayjs()
          .add(PROFILE_COUNTDOWN_DEFAULT_DAYS, "day")
          .startOf("hour")
          .toISOString(),
        title: null
      });
  }
};
