import {
  detectPlatform,
  normalizeHotkey,
  parseHotkey
} from "@tanstack/hotkeys";

export const DEFAULT_KEYBOARD_SHORTCUTS = {
  quickSwitcher: "Mod+K",
  showShortcuts: "Mod+/",
  toggleMemberList: "Mod+Alt+M",
  openSettings: "Mod+Comma",
  nextUnreadChannel: "Alt+ArrowDown",
  previousUnreadChannel: "Alt+ArrowUp",
  toggleMute: "Mod+Shift+M",
  toggleDeafen: "Mod+Shift+D",
  disconnectVoice: ""
} satisfies Record<string, string>;

export type KeyboardShortcutId = keyof typeof DEFAULT_KEYBOARD_SHORTCUTS;

export const KEYBOARD_SHORTCUT_IDS = Object.keys(
  DEFAULT_KEYBOARD_SHORTCUTS
) as KeyboardShortcutId[];

export const GLOBAL_SHORTCUT_IDS = [
  "toggleMute",
  "toggleDeafen"
] as const satisfies readonly KeyboardShortcutId[];

export type GlobalShortcutId = (typeof GLOBAL_SHORTCUT_IDS)[number];

export function isGlobalShortcutId(id: string): id is GlobalShortcutId {
  return (GLOBAL_SHORTCUT_IDS as readonly string[]).includes(id);
}

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

export function pruneKeyboardShortcutOverrides(
  overrides: Partial<Record<KeyboardShortcutId, string>>
): Partial<Record<KeyboardShortcutId, string>> {
  const pruned: Partial<Record<KeyboardShortcutId, string>> = {};

  for (const id of KEYBOARD_SHORTCUT_IDS) {
    const value = overrides[id];
    if (typeof value !== "string") continue;

    const isDefault =
      value !== "" &&
      normalizeKeyboardShortcut(value) ===
        normalizeKeyboardShortcut(DEFAULT_KEYBOARD_SHORTCUTS[id]);
    if (isDefault) continue;

    pruned[id] = value;
  }

  return pruned;
}

export type SystemShortcutWarning = "keyboardLayout" | "reserved";

type Platform = ReturnType<typeof detectPlatform>;

const RESERVED_SYSTEM_SHORTCUTS: Record<Platform, string[]> = {
  windows: [
    "Alt+Tab",
    "Alt+F4",
    "Alt+Space",
    "Alt+Escape",
    "Control+Escape",
    "Control+Shift+Escape",
    "Control+Alt+Delete"
  ],
  mac: [
    "Meta+Space",
    "Control+Space",
    "Meta+Tab",
    "Meta+Q",
    "Meta+H",
    "Meta+M",
    "Control+ArrowLeft",
    "Control+ArrowRight",
    "Control+ArrowUp",
    "Control+ArrowDown"
  ],
  linux: ["Alt+Tab", "Alt+F4", "Control+Alt+Delete", "Meta+Space"]
};

export function getSystemShortcutWarning(
  hotkey: string
): SystemShortcutWarning | null {
  if (!hotkey.trim()) return null;

  const platform = detectPlatform();
  const normalized = normalizeHotkey(hotkey, platform);

  const isReserved = RESERVED_SYSTEM_SHORTCUTS[platform].some(
    (reserved) => normalizeHotkey(reserved, platform) === normalized
  );
  if (isReserved) return "reserved";

  if (platform === "mac") return null;

  const parsed = parseHotkey(hotkey, platform);
  if (parsed.meta) return "reserved";
  if (parsed.alt && parsed.shift && !parsed.ctrl) return "keyboardLayout";

  return null;
}

const ELECTRON_KEY_NAMES: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Enter: "Return",
  "+": "Plus"
};

export function toElectronAccelerator(hotkey: string): string | null {
  if (!hotkey.trim()) return null;

  const platform = detectPlatform();
  const parsed = parseHotkey(hotkey, platform);

  const parts: string[] = [];
  if (parsed.ctrl) parts.push("Control");
  if (parsed.alt) parts.push("Alt");
  if (parsed.shift) parts.push("Shift");
  if (parsed.meta) parts.push(platform === "mac" ? "Command" : "Super");

  parts.push(ELECTRON_KEY_NAMES[parsed.key] ?? parsed.key);
  return parts.join("+");
}
