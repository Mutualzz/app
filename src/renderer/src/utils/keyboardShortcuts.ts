import { normalizeHotkey } from "@tanstack/hotkeys";

export type KeyboardShortcutId = "toggleMemberList" | "openSettings";

export const KEYBOARD_SHORTCUT_IDS: KeyboardShortcutId[] = [
  "toggleMemberList",
  "openSettings"
];

export const DEFAULT_KEYBOARD_SHORTCUTS: Record<KeyboardShortcutId, string> = {
  toggleMemberList: "Mod+Alt+M",
  openSettings: "Mod+Comma"
};

export function normalizeKeyboardShortcut(value: string) {
  if (!value.trim()) return "";
  return normalizeHotkey(value);
}

export function mergeKeyboardShortcuts(
  partial?: Partial<Record<KeyboardShortcutId, string>> | null
): Record<KeyboardShortcutId, string> {
  const merged = { ...DEFAULT_KEYBOARD_SHORTCUTS, ...(partial ?? {}) };
  for (const id of KEYBOARD_SHORTCUT_IDS) {
    if (partial?.[id] === "") {
      merged[id] = "";
    }
  }
  return merged;
}

export function isKeyboardShortcutCustomized(
  id: KeyboardShortcutId,
  shortcuts: Record<KeyboardShortcutId, string>
) {
  return shortcuts[id] !== DEFAULT_KEYBOARD_SHORTCUTS[id];
}

export function findKeyboardShortcutConflict(
  id: KeyboardShortcutId,
  hotkey: string,
  shortcuts: Record<KeyboardShortcutId, string>
): KeyboardShortcutId | null {
  if (!hotkey.trim()) return null;

  const normalized = normalizeKeyboardShortcut(hotkey);

  for (const otherId of KEYBOARD_SHORTCUT_IDS) {
    if (otherId === id) continue;

    const other = shortcuts[otherId];
    if (!other.trim()) continue;

    if (normalizeKeyboardShortcut(other) === normalized) {
      return otherId;
    }
  }

  return null;
}
