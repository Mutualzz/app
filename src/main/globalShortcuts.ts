import { app, globalShortcut } from "electron";
import { getMainWindow } from "./windows";

const ALLOWED_IDS = new Set(["toggleMute", "toggleDeafen"]);
const registeredAccelerators = new Map<string, string>();

function unregisterOurs() {
  for (const accelerator of registeredAccelerators.values()) {
    globalShortcut.unregister(accelerator);
  }
  registeredAccelerators.clear();
}

export function setGlobalShortcuts(bindings: unknown): string[] {
  unregisterOurs();
  if (!bindings || typeof bindings !== "object") return [];

  const failedIds: string[] = [];

  for (const [id, accelerator] of Object.entries(bindings)) {
    if (!ALLOWED_IDS.has(id)) continue;
    if (typeof accelerator !== "string" || !accelerator) continue;

    let registered = false;
    try {
      registered = globalShortcut.register(accelerator, () => {
        const window = getMainWindow();
        if (window && !window.isDestroyed()) {
          window.webContents.send("global-shortcut:triggered", id);
        }
      });
    } catch {
      registered = false;
    }

    if (registered) registeredAccelerators.set(id, accelerator);
    else failedIds.push(id);
  }

  return failedIds;
}

app.on("will-quit", unregisterOurs);
