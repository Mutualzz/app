import { app, BrowserWindow, ipcMain, nativeImage, powerMonitor } from "electron";
import { trayManager } from "./tray";
import { getMainWindow } from "./windows";
import keytar from "keytar";
import { existsSync, promises as fsPromises } from "fs";

let pendingStartupDeepLink: string | null = null;

export function setPendingDeepLink(url: string) {
  pendingStartupDeepLink = url;
}
import path from "path";
import {
  getScreenCaptureAccessStatus,
  listDesktopCaptureSources
} from "./displayMedia";

const SERVICE = "mutualzz";
const ACCOUNT = "default";

function setWindowsBadge(
  win: BrowserWindow,
  count: number,
  color: string = "#e03131"
) {
  if (count === 0) {
    win.setOverlayIcon(null, "");
    return;
  }

  const size = 20;
  const { createCanvas } = require("canvas");
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(count > 99 ? "99+" : String(count), size / 2, size / 2 + 1);

  const image = nativeImage.createFromDataURL(canvas.toDataURL());
  win.setOverlayIcon(image, `${count} unread mentions`);
}

export function setupIPC(): void {
  ipcMain.handle("app:get-startup-deep-link", () => {
    const url = pendingStartupDeepLink;
    pendingStartupDeepLink = null;
    return url;
  });

  // Token Storage
  ipcMain.handle("storage:get-token", async () => {
    try {
      const token = await keytar.getPassword(SERVICE, ACCOUNT);
      return token || null;
    } catch (err: any) {
      console.error("Failed to read token:", err);
      return null;
    }
  });

  ipcMain.handle("storage:set-token", async (_, token: string) => {
    try {
      await keytar.setPassword(SERVICE, ACCOUNT, token);
    } catch (err) {
      console.error("Failed to write token:", err);
      throw err;
    }
  });

  ipcMain.handle("storage:delete-token", async (_) => {
    try {
      await keytar.deletePassword(SERVICE, ACCOUNT);
    } catch (err) {
      console.error("Failed to delete token:", err);
    }
  });

  // OS/App Info
  ipcMain.handle("app:get-version", () => app.getVersion());
  ipcMain.handle("app:get-name", () => app.getName());
  ipcMain.handle("app:is-packaged", () => app.isPackaged);

  ipcMain.handle("system:get-os-info", () => {
    const os = require("os");

    const platformMap: Record<string, string> = {
      darwin: "macos",
      linux: "linux",
      win32: "windows"
    };

    const typeMap: Record<string, string> = {
      Darwin: "macos",
      Linux: "linux",
      Windows_NT: "windows"
    };

    return {
      platform: platformMap[process.platform] || "unknown",
      type: typeMap[os.type()] || "unknown",
      arch: os.arch(),
      family: os.platform()
    };
  });

  ipcMain.handle("system:list-processes", async (_, filterExes: string[]) => {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      if (process.platform === "win32") {
        const { stdout: output } = await execAsync("tasklist /nh /fo csv", {
          encoding: "utf-8",
          windowsHide: true,
          maxBuffer: 10 * 1024 * 1024
        });
        const lines = output.split("\n").filter((l) => l.trim());

        const processes = lines.map((line) => {
          const parts = line.split('","');
          return {
            name: parts[0]?.replace(/"/g, "").trim() || "",
            pid: parseInt(parts[1]?.replace(/"/g, "") || "0")
          };
        });

        return processes.filter((p) =>
          filterExes.some((exe) =>
            p.name.toLowerCase().includes(exe.toLowerCase())
          )
        );
      }

      // macOS/Linux
      const { stdout: output } = await execAsync("ps aux", {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024
      });
      const lines = output.split("\n").slice(1);

      const processes = lines.map((line) => {
        const parts = line.split(/\s+/);
        return {
          pid: parseInt(parts[1]),
          name: parts[10] || ""
        };
      });

      return processes.filter((p) =>
        filterExes.some((exe) =>
          p.name.toLowerCase().includes(exe.toLowerCase())
        )
      );
    } catch (err) {
      console.error("Failed to list processes:", err);
      return [];
    }
  });

  // Shell/External
  ipcMain.handle("shell:open-external", async (_, url: string) => {
    try {
      const { shell } = await import("electron");
      await shell.openExternal(url);
    } catch (err) {
      console.error("Failed to open external URL:", err);
      throw err;
    }
  });

  // Clipboard
  ipcMain.handle("clipboard:write", async (_, text: string) => {
    try {
      const { clipboard } = await import("electron");
      clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to write to clipboard:", err);
      throw err;
    }
  });

  ipcMain.handle("clipboard:read", async () => {
    try {
      const { clipboard } = await import("electron");
      return clipboard.readText();
    } catch (err) {
      console.error("Failed to read from clipboard:", err);
      return "";
    }
  });

  // Desktop Integration
  ipcMain.handle("app:relaunch", async () => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle("desktop:set-autostart", async (_, enabled: boolean) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: enabled
      });
    } catch (err) {
      console.error("Failed to set autostart:", err);
      throw err;
    }
  });

  ipcMain.handle("desktop:get-autostart", async () => {
    try {
      return app.getLoginItemSettings().openAtLogin;
    } catch (err) {
      console.error("Failed to get autostart:", err);
      return false;
    }
  });

  ipcMain.handle("desktop:list-capture-sources", async () => {
    try {
      return await listDesktopCaptureSources();
    } catch (err) {
      console.error("Failed to list desktop capture sources:", err);
      return [];
    }
  });

  ipcMain.handle("desktop:get-screen-capture-access", () => {
    return getScreenCaptureAccessStatus();
  });

  ipcMain.handle("desktop:open-screen-capture-settings", async () => {
    try {
      const { shell } = await import("electron");
      if (process.platform === "darwin") {
        await shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
        );
        return;
      }
      if (process.platform === "win32") {
        await shell.openExternal("ms-settings:privacy");
      }
    } catch (err) {
      console.error("Failed to open screen capture settings:", err);
      throw err;
    }
  });

  // Theme/Icon Updates
  // These are called from preload when theme changes
  ipcMain.handle("theme:update-icons", async (_, dataUrl: string) => {
    const window = getMainWindow();
    if (!window) return;

    // Update tray icon
    trayManager.updateIcon(dataUrl);

    // Update window icon
    trayManager.setWindowIcon(window, dataUrl);
  });

  ipcMain.handle("theme:read-icon", async (_, relativePath: string) => {
    try {
      const candidates = app.isPackaged
        ? [
            path.join(
              process.resourcesPath,
              "app.asar.unpacked",
              "resources",
              relativePath
            ),
            path.join(process.resourcesPath, relativePath)
          ]
        : [path.join(__dirname, "..", "..", "resources", relativePath)];

      const fullPath = candidates.find((p) => existsSync(p));

      if (!fullPath) {
        throw new Error(`Icon not found. Tried: ${candidates.join(" | ")}`);
      }

      const buf = await fsPromises.readFile(fullPath);
      const ext = path.extname(fullPath).slice(1).toLowerCase();

      const mime =
        ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : "application/octet-stream";

      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch (err) {
      console.error("[theme:read-icon] failed:", err);
      return null;
    }
  });

  ipcMain.on("badge:set", (_, count: number, color?: string) => {
    app.setBadgeCount(count);

    const win = getMainWindow();
    if (win) setWindowsBadge(win, count, color);
  });

  // Idle detection
  let idleThresholdSeconds = 5 * 60;
  let lastIdleState: string | null = null;

  ipcMain.on("idle:set-threshold", (_, ms: number) => {
    idleThresholdSeconds = Math.max(60, Math.floor(ms / 1000));
    // Re-evaluate immediately so the new threshold takes effect without waiting for the next tick
    const win = getMainWindow();
    if (!win || win.isDestroyed()) return;
    const state = powerMonitor.getSystemIdleState(idleThresholdSeconds);
    if (state !== lastIdleState) {
      lastIdleState = state;
      win.webContents.send("idle:change", state);
    }
  });

  setInterval(() => {
    const win = getMainWindow();
    if (!win || win.isDestroyed()) return;
    const state = powerMonitor.getSystemIdleState(idleThresholdSeconds);
    if (state !== lastIdleState) {
      lastIdleState = state;
      win.webContents.send("idle:change", state);
    }
  }, 30_000);
}
