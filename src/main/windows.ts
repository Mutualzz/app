import { BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import iconPng from "../../resources/icons/base/icon.png?asset";
import iconIco from "../../resources/icons/base/icon.ico?asset";

let mainWindow: BrowserWindow | null = null;
let closeBlocked = false;

export function setCloseBlocked(value: boolean) {
    closeBlocked = value;
}

export function createMainWindow(): BrowserWindow {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        center: true,
        titleBarStyle: "hidden",
        trafficLightPosition: { x: 16, y: 18 },
        ...(process.platform === "linux"
            ? { icon: iconPng }
            : process.platform === "win32"
              ? { icon: iconIco }
              : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: true,
            contextIsolation: true
        }
    });

    mainWindow.webContents.session.setPermissionCheckHandler(
        (_webContents, permission) => {
            return [
                "clipboard-read",
                "clipboard-sanitized-write",
                "fullscreen",
                "hid",
                "idle-detection",
                "media",
                "mediaKeySystem",
                "notifications",
                "openExternal",
                "pointerLock",
                "usb"
            ].includes(permission);
        }
    );

    mainWindow.webContents.session.setPermissionRequestHandler(
        (_webContents, permission, callback) => {
            const allowed = [
                "media",
                "mediaKeySystem",
                "microphone",
                "camera",
                "notifications",
                "fullscreen",
                "pointerLock",
                "usb",
                "hid"
            ];
            callback(allowed.includes(permission));
        }
    );

    mainWindow.on("close", (event) => {
        if (closeBlocked) {
            event.preventDefault();
        }
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow?.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
        const { shell } = require("electron");
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    ipcMain.handle("window:minimize", () => {
        const win = getMainWindow();
        if (win) win.minimize();
    });

    ipcMain.handle("window:maximize", () => {
        const win = getMainWindow();
        if (!win) return;
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
    });

    ipcMain.handle("window:close", () => {
        const win = getMainWindow();
        if (win) win.close();
    });

    ipcMain.handle("window:is-maximized", () => {
        const win = getMainWindow();
        return win ? win.isMaximized() : false;
    });

    return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
    return mainWindow;
}
