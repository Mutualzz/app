import { BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import { Logger } from "@mutualzz/logger";
import { setCloseBlocked } from "./windows";

const logger = new Logger({ tag: "Updater" });

let mainWindow: BrowserWindow | null = null;

export function initUpdater(window: BrowserWindow) {
    mainWindow = window;

    autoUpdater.logger = logger;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    setTimeout(() => {
        checkForUpdates();
    }, 2000);

    autoUpdater.on("checking-for-update", () => {
        logger.info("Checking for update...");
        mainWindow?.webContents.send("updater:checking");
    });

    autoUpdater.on("update-available", (info) => {
        logger.info("Update available:", info.version);
        mainWindow?.webContents.send("updater:update-available", {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes
        });
    });

    autoUpdater.on("update-not-available", () => {
        logger.info("No update available");
        mainWindow?.webContents.send("updater:no-update");
        setCloseBlocked(false);
    });

    autoUpdater.on("error", (error) => {
        logger.error("Updater error:", error);
        mainWindow?.webContents.send("updater:error", error.message);
        setCloseBlocked(false);
    });

    autoUpdater.on("download-progress", (progressObj) => {
        logger.debug("Download progress:", progressObj.percent);
        mainWindow?.webContents.send("updater:download-progress", {
            percent: progressObj.percent,
            bytesPerSecond: progressObj.bytesPerSecond,
            transferred: progressObj.transferred,
            total: progressObj.total
        });
    });

    autoUpdater.on("update-downloaded", () => {
        logger.info("Update downloaded");
        mainWindow?.webContents.send("updater:update-downloaded");
        setCloseBlocked(true);
    });

    ipcMain.handle("updater:check", async () => {
        return checkForUpdates();
    });

    ipcMain.handle("updater:download", async () => {
        try {
            await autoUpdater.downloadUpdate();
        } catch (err) {
            logger.error("Failed to download update:", err);
            throw err;
        }
    });

    ipcMain.handle("updater:install", async () => {
        try {
            setCloseBlocked(false);
            autoUpdater.quitAndInstall();
        } catch (err) {
            logger.error("Failed to install update:", err);
            throw err;
        }
    });

    ipcMain.handle("updater:check-on-startup", async () => {
        return checkForUpdates(true);
    });
}

async function checkForUpdates(isLaunchCheck = false): Promise<void> {
    try {
        if (process.env.NODE_ENV !== "production" && !isLaunchCheck) {
            logger.debug("Skipping update check in development");
            return;
        }

        await autoUpdater.checkForUpdates();
    } catch (err) {
        logger.error("Error checking for updates:", err);
    }
}

export function quitAndInstall(): void {
    setCloseBlocked(false);
    autoUpdater.quitAndInstall();
}
