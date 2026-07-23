import type { MessageDisplay, UiDensity } from "@mutualzz/types";
import {
  getMessageGroupGapMs,
  getMessageLayoutNativeStyles,
  shouldShowMessageAvatar,
} from "@mutualzz/client";

export const MESSAGE_DENSITY_PADDING_Y_VAR = "--message-density-padding-y";
export const MESSAGE_DENSITY_HEADER_MARGIN_VAR =
  "--message-density-header-margin-top";
export const MESSAGE_DENSITY_GROUP_GAP_VAR = "--message-density-group-gap";

const MESSAGE_DISPLAY_CSS: Record<
  MessageDisplay,
  Pick<MessageLayoutStyles, "paddingY" | "headerMarginTop">
> = {
  default: {
    paddingY: "0.2rem",
    headerMarginTop: "0.625rem",
  },
  compact: {
    paddingY: "0.0625rem",
    headerMarginTop: "0.125rem",
  },
};

const UI_DENSITY_GROUP_GAP_CSS: Record<
  UiDensity,
  Pick<MessageLayoutStyles, "groupGap">
> = {
  compact: { groupGap: "0.25rem" },
  default: { groupGap: "0.375rem" },
  spacious: { groupGap: "0.875rem" },
};

export type MessageLayoutStyles = {
  paddingY: string;
  headerMarginTop: string;
  groupGap: string;
  paddingYNative: number;
  headerMarginTopNative: number;
  groupGapNative: number;
};

export { getMessageGroupGapMs, shouldShowMessageAvatar };

export function getMessageLayoutStyles(
  messageDisplay: MessageDisplay,
  uiDensity: UiDensity,
): MessageLayoutStyles {
  return {
    ...MESSAGE_DISPLAY_CSS[messageDisplay],
    ...UI_DENSITY_GROUP_GAP_CSS[uiDensity],
    ...getMessageLayoutNativeStyles(messageDisplay, uiDensity),
  };
}

export function applyMessageLayout(
  messageDisplay: MessageDisplay,
  uiDensity: UiDensity,
) {
  if (typeof document === "undefined") return;

  const styles = getMessageLayoutStyles(messageDisplay, uiDensity);
  document.documentElement.style.setProperty(
    MESSAGE_DENSITY_PADDING_Y_VAR,
    styles.paddingY,
  );
  document.documentElement.style.setProperty(
    MESSAGE_DENSITY_HEADER_MARGIN_VAR,
    styles.headerMarginTop,
  );
  document.documentElement.style.setProperty(
    MESSAGE_DENSITY_GROUP_GAP_VAR,
    styles.groupGap,
  );
}
