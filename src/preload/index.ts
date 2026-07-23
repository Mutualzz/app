import { contextBridge, ipcRenderer } from "electron";

const electronBridge = {
  ipcRenderer: {
    send: (channel: string, ...args: unknown[]) =>
      ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (...args: unknown[]) => void) => {
      const wrapped = (_event: unknown, ...args: unknown[]) =>
        listener(...args);
      ipcRenderer.on(channel, wrapped);
      return () => ipcRenderer.removeListener(channel, wrapped);
    },
    once: (channel: string, listener: (...args: unknown[]) => void) => {
      ipcRenderer.once(channel, (_event, ...args) => listener(...args));
    },
    removeAllListeners: (channel: string) =>
      ipcRenderer.removeAllListeners(channel)
  }
};

function on(channel: string, callback: (...args: any[]) => void) {
  const wrapped = (_event: unknown, ...args: unknown[]) => callback(...args);
  ipcRenderer.on(channel, wrapped);
  return () => ipcRenderer.removeListener(channel, wrapped);
}

const api = {
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version"),
    getName: () => ipcRenderer.invoke("app:get-name"),
    isPackaged: () => ipcRenderer.invoke("app:is-packaged"),
    relaunch: () => ipcRenderer.invoke("app:relaunch"),
    getStartupDeepLink: (): Promise<string | null> =>
      ipcRenderer.invoke("app:get-startup-deep-link")
  },
  system: {
    getOsInfo: () => ipcRenderer.invoke("system:get-os-info"),
    listProcesses: (filterExes?: string[]) =>
      ipcRenderer.invoke("system:list-processes", filterExes ?? []),
    getCachedProcesses: (filterExes?: string[]) =>
      ipcRenderer.invoke("system:get-cached-processes", filterExes ?? []),
    refreshProcesses: () => ipcRenderer.invoke("system:refresh-processes")
  },
  presence: {
    getRpcActivities: () => ipcRenderer.invoke("presence:get-rpc-activities"),
    onRpcUpdated: (callback: () => void) => on("presence:rpc-updated", callback)
  },
  badge: {
    set: (count: number, color?: string) =>
      ipcRenderer.send("badge:set", count, color)
  },
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell:open-external", url)
  },
  storage: {
    getToken: () => ipcRenderer.invoke("storage:get-token"),
    setToken: (token: string) => ipcRenderer.invoke("storage:set-token", token),
    deleteToken: () => ipcRenderer.invoke("storage:delete-token")
  },
  clipboard: {
    write: (text: string) => ipcRenderer.invoke("clipboard:write", text),
    read: () => ipcRenderer.invoke("clipboard:read")
  },
  desktop: {
    setAutostart: (enabled: boolean) =>
      ipcRenderer.invoke("desktop:set-autostart", enabled),
    getAutostart: () => ipcRenderer.invoke("desktop:get-autostart"),
    listCaptureSources: () =>
      ipcRenderer.invoke("desktop:list-capture-sources"),
    getScreenCaptureAccess: () =>
      ipcRenderer.invoke("desktop:get-screen-capture-access"),
    openScreenCaptureSettings: () =>
      ipcRenderer.invoke("desktop:open-screen-capture-settings")
  },
  theme: {
    updateIcons: (dataUrl: string) =>
      ipcRenderer.invoke("theme:update-icons", dataUrl),
    readIcon: (relativePath: string) =>
      ipcRenderer.invoke("theme:read-icon", relativePath)
  },
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized")
  },
  contextMenu: {
    replaceMisspelling: (word: string) =>
      ipcRenderer.invoke("context-menu:replace-misspelling", word),
    addToDictionary: (word: string) =>
      ipcRenderer.invoke("context-menu:add-to-dictionary", word)
  },
  spellcheck: {
    setEnabled: (enabled: boolean) =>
      ipcRenderer.invoke("spellcheck:set-enabled", enabled)
  },
  codec: {
    etfEncode: (payload: any) =>
      ipcRenderer.invoke("codec:etf-encode", payload),
    etfDecode: (payload: number[]) =>
      ipcRenderer.invoke("codec:etf-decode", payload)
  },
  updater: {
    getVersion: (): Promise<string> =>
      ipcRenderer.invoke("updater:get-version"),
    getPlatform: (): Promise<string> =>
      ipcRenderer.invoke("updater:get-platform"),
    getLinuxPackage: (): Promise<
      "appimage" | "debian" | "rpm" | "pacman"
    > => ipcRenderer.invoke("updater:get-linux-package"),
    getBinarySha256: (): Promise<string | null> =>
      ipcRenderer.invoke("updater:get-binary-sha256"),
    getUpdaterVersion: (): Promise<string | null> =>
      ipcRenderer.invoke("updater:get-updater-version"),
    getSavePath: (version: string, url: string): Promise<string> =>
      ipcRenderer.invoke("updater:get-save-path", version, url),
    download: (
      url: string,
      savePath: string,
      sha256: string
    ): Promise<{ path: string }> =>
      ipcRenderer.invoke("updater:download", url, savePath, sha256),
    apply: (updatePath: string, version: string): Promise<void> =>
      ipcRenderer.invoke("updater:apply", updatePath, version)
  },
  idle: {
    setThreshold: (ms: number) => ipcRenderer.send("idle:set-threshold", ms),
    onIdleChange: (
      callback: (state: "active" | "idle" | "locked" | "unknown") => void
    ) => on("idle:change", callback)
  },
  events: {
    onDeepLink: (callback: (url: string) => void) => on("deep-link", callback),
    onContextMenuEditable: (
      callback: (params: {
        x: number;
        y: number;
        isEditable: boolean;
        selectionText: string;
        canCut: boolean;
        canCopy: boolean;
        canPaste: boolean;
        misspelledWord: string;
        dictionarySuggestions: string[];
      }) => void
    ) => on("context-menu:editable", callback),
    onUpdaterChecking: (callback: () => void) =>
      on("updater:checking", callback),
    onUpdaterAvailable: (callback: (info: any) => void) =>
      on("updater:update-available", callback),
    onUpdaterDownloading: (callback: () => void) =>
      on("updater:downloading", callback),
    onUpdaterProgress: (callback: (progress: any) => void) =>
      on("updater:download-progress", callback),
    onUpdaterDownloaded: (callback: () => void) =>
      on("updater:update-downloaded", callback),
    onUpdaterNotAvailable: (callback: () => void) =>
      on("updater:no-update", callback),
    onUpdaterError: (callback: (error: string) => void) =>
      on("updater:error", callback),
    onUpdaterDownloadProgress: (
      callback: (data: {
        percent: number;
        downloaded: number;
        total: number;
        bytesPerSecond?: number;
      }) => void
    ) => on("updater:download-progress", callback)
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronBridge);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronBridge;
  // @ts-ignore
  window.api = api;
}
