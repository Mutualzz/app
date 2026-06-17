import { app, BrowserWindow } from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import { createMainWindow, setQuitting } from "./windows";
import { setupIPC } from "./ipc";
import { setupProtocols } from "./protocols";
import { trayManager } from "./tray";
import { setupCodecIPC } from "./codec";
import { initUpdaterHandlers } from "./updater";
import { setupDisplayMedia } from "./displayMedia";

app.setName("Mutualzz");

let mainWindow: BrowserWindow | null = null;

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) app.quit();

app.on("second-instance", () => {
  const win = mainWindow;
  if (!win) return;

  if (win.isMinimized()) win.restore();
  if (!win.isVisible()) win.show();
  win.focus();
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.mutualzz.app");
  setupDisplayMedia();

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  mainWindow = createMainWindow();

  initUpdaterHandlers();
  setupCodecIPC();
  setupIPC();
  setupProtocols(mainWindow);
  trayManager.initialize(mainWindow);

  app.setAsDefaultProtocolClient("mutualzz");

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
  trayManager.destroy();
});
