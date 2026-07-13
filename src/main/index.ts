import { app, BrowserWindow } from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import path from "path";
import { setupIPC, setPendingDeepLink } from "./ipc";
import { createMainWindow, setQuitting, setupWindowIPC } from "./windows";
import { setupProtocols } from "./protocols";
import { trayManager } from "./tray";
import { setupCodecIPC } from "./codec";
import { initUpdaterHandlers } from "./updater";
import { setupDisplayMedia } from "./displayMedia";
import { stopProcessCache } from "./processCache";
import { stopRpc } from "./rpc";

app.setName("Mutualzz");

let mainWindow: BrowserWindow | null = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) app.quit();

app.on("second-instance", (_, argv) => {
  const win = mainWindow;
  if (!win) return;

  if (win.isMinimized()) win.restore();
  if (!win.isVisible()) win.show();
  win.focus();

  const url = argv.find((arg) => arg.startsWith("mutualzz://"));
  if (url) win.webContents.send("deep-link", url);
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.mutualzz.app");
  setupDisplayMedia();

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindow = createMainWindow();

  const startupDeepLink = process.argv.find((arg) =>
    arg.startsWith("mutualzz://")
  );
  if (startupDeepLink) setPendingDeepLink(startupDeepLink);

  initUpdaterHandlers();
  setupWindowIPC();
  setupCodecIPC();
  setupIPC();
  setupProtocols(mainWindow);
  trayManager.initialize(mainWindow);

  if (app.isPackaged) {
    app.setAsDefaultProtocolClient("mutualzz");
  } else {
    app.setAsDefaultProtocolClient("mutualzz", process.execPath, [
      path.resolve(process.argv[1])
    ]);
  }

  app.on("activate", () => {
    if (!mainWindow || mainWindow.isDestroyed())
      mainWindow = createMainWindow();
    else {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  setQuitting(true);
  stopProcessCache();
  stopRpc();
  trayManager.destroy();
});
