import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import iconPng from "../../resources/icons/base/icon.png?asset";
import iconIco from "../../resources/icons/base/icon.ico?asset";

let mainWindow: BrowserWindow | null = null;
let closeBlocked = false;
let quitting = false;

export function setCloseBlocked(value: boolean) {
  closeBlocked = value;
}

export function setQuitting(value: boolean) {
  quitting = value;
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
      contextIsolation: true,
      autoplayPolicy: "no-user-gesture-required"
    }
  });

  const availableSpellCheckerLanguages =
    mainWindow.webContents.session.availableSpellCheckerLanguages;
  const locale = app.getLocale();
  mainWindow.webContents.session.setSpellCheckerLanguages(
    availableSpellCheckerLanguages.includes(locale) ? [locale] : ["en-US"]
  );

  mainWindow.on("focus", () => {
    globalShortcut.register("CommandOrControl+R", () => {
      const win = getMainWindow();
      if (win && !win.isDestroyed()) win.webContents.reload();
    });
  });

  mainWindow.on("blur", () => {
    globalShortcut.unregister("CommandOrControl+R");
  });

  mainWindow.on("closed", () => {
    globalShortcut.unregister("CommandOrControl+R");
  });

  mainWindow.webContents.session.setPermissionCheckHandler(
    (_webContents, permission) => {
      return [
        "clipboard-read",
        "clipboard-sanitized-write",
        "display-capture",
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
        "display-capture",
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
      return;
    }

    if (!quitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on("context-menu", (_e, params) => {
    if (params.isEditable || params.selectionText) {
      mainWindow?.webContents.send("context-menu:editable", {
        x: params.x,
        y: params.y,
        isEditable: params.isEditable,
        selectionText: params.selectionText,
        canCut: params.editFlags.canCut,
        canCopy: params.editFlags.canCopy,
        canPaste: params.editFlags.canPaste,
        misspelledWord: params.misspelledWord,
        dictionarySuggestions: params.dictionarySuggestions
      });
      return;
    }

    if (is.dev) {
      const { Menu, MenuItem } = require("electron");
      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: "Inspect Element",
          click: () =>
            mainWindow?.webContents.inspectElement(params.x, params.y)
        })
      );
      menu.popup();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    const { shell } = require("electron");
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"])
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  else mainWindow.loadFile(join(__dirname, "../renderer/index.html"));

  let rendererCrashReloads = 0;
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("Renderer process gone", details);
    if (details.reason === "clean-exit") return;
    if (rendererCrashReloads >= 2) return;
    rendererCrashReloads += 1;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.reload();
    }
  });

  mainWindow.webContents.on("unresponsive", () => {
    console.error("Renderer became unresponsive");
  });

  return mainWindow;
}

export function setupWindowIPC(): void {
  ipcMain.handle("window:minimize", () => {
    getMainWindow()?.minimize();
  });

  ipcMain.handle("window:maximize", () => {
    const win = getMainWindow();
    if (!win) return;
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.handle("window:close", () => {
    getMainWindow()?.hide();
  });

  ipcMain.handle("window:is-maximized", () => {
    return getMainWindow()?.isMaximized() ?? false;
  });

  ipcMain.handle("context-menu:replace-misspelling", (_, word: string) => {
    getMainWindow()?.webContents.replaceMisspelling(word);
  });

  ipcMain.handle("spellcheck:set-enabled", (_, enabled: boolean) => {
    const win = getMainWindow();
    if (!win) return;
    win.webContents.session.spellCheckerEnabled = enabled;
  });

  ipcMain.handle("context-menu:add-to-dictionary", (_, word: string) => {
    getMainWindow()?.webContents.session.addWordToSpellCheckerDictionary(
      word
    );
  });
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
