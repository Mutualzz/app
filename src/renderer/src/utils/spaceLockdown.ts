import type { ContextMenuPayload } from "@contexts/ContextMenu.context";
import type { Space } from "@stores/objects/Space";
import { toast } from "react-toastify";

const LOCKDOWN_TOAST_ID = "space-lockdown";

const LOCKDOWN_ALLOWED_MODAL_IDS = new Set([
  "space-invite",
  "leave-space-confirm"
]);

export function getSpaceLockdownMessage(_space: Space, isOwner: boolean) {
  return isOwner
    ? "Messaging and changes are disabled. Check your email for an appeal link if you believe this was a mistake."
    : "Messaging and changes are disabled while staff review this space.";
}

export function notifySpaceLockdownBlocked(force = false) {
  if (force) {
    toast.dismiss(LOCKDOWN_TOAST_ID);
  } else if (toast.isActive(LOCKDOWN_TOAST_ID)) {
    return;
  }

  toast.info("This space is in lockdown. Messaging and changes are disabled.", {
    toastId: LOCKDOWN_TOAST_ID,
    autoClose: 4000
  });
}

export function isModalAllowedDuringSpaceLockdown(modalId: string) {
  if (LOCKDOWN_ALLOWED_MODAL_IDS.has(modalId)) return true;
  if (modalId.startsWith("report-space-")) return true;
  return false;
}

export function getContextMenuSpace(
  menu: ContextMenuPayload,
  getSpace?: (spaceId: string) => Space | undefined
): Space | undefined {
  switch (menu.type) {
    case "space":
    case "channel-list":
    case "channel":
    case "role":
      return menu.space;
    case "user":
      return menu.space;
    case "message":
      return menu.message.spaceId && getSpace
        ? getSpace(menu.message.spaceId)
        : undefined;
    default:
      return undefined;
  }
}

export function isContextMenuBlockedByLockdown(
  menu: ContextMenuPayload,
  getSpace?: (spaceId: string) => Space | undefined,
  activeSpace?: Space | null
) {
  if (menu.type === "space" && menu.fromSidebar) return false;
  if (
    menu.type === "account" ||
    menu.type === "group-dm" ||
    menu.type === "editable" ||
    menu.type === "custom"
  ) {
    return false;
  }

  if (menu.type === "emoji" || menu.type === "sticker") {
    return activeSpace?.isInLockdown ?? false;
  }

  const space = getContextMenuSpace(menu, getSpace);
  return space?.isInLockdown ?? false;
}

export function shouldCloseModalDuringSpaceLockdown(modalId: string) {
  return !isModalAllowedDuringSpaceLockdown(modalId);
}
