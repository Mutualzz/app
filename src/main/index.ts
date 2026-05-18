import { app, BrowserWindow } from "electron";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { createMainWindow } from "./windows";
import { setupIPC } from "./ipc";
import { setupProtocols } from "./protocols";
import { initUpdater } from "./updater";
import { trayManager } from "./tray";
import { setupCodecIPC } from "./codec";

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.mutualzz.app");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    mainWindow = createMainWindow();

    setupCodecIPC();
    setupIPC();
    setupProtocols(mainWindow);
    trayManager.initialize(mainWindow);

    if (!is.dev && app.isPackaged) initUpdater(mainWindow);

    app.setAsDefaultProtocolClient("mutualzz");

    app.on("activate", () => {
        if (!mainWindow || mainWindow.isDestroyed()) {
            mainWindow = createMainWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("before-quit", () => {
    trayManager.destroy();
});
