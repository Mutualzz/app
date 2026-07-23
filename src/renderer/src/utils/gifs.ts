export const MESSAGE_GIF_MAX_WIDTH = 400;
export const MESSAGE_GIF_MAX_HEIGHT = 300;
export const COMMENT_GIF_MAX_WIDTH = 280;
export const COMMENT_GIF_MAX_HEIGHT = 220;

export function computeContainedSize(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  if (!naturalWidth || !naturalHeight) {
    return {
      width: Math.min(maxWidth, 160),
      height: Math.min(maxHeight, 120)
    };
  }

  const scale = Math.min(
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
    1
  );

  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale))
  };
}
