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

const api = {
    app: {
        getVersion: () => ipcRenderer.invoke("app:get-version"),
        getName: () => ipcRenderer.invoke("app:get-name"),
        relaunch: () => ipcRenderer.invoke("app:relaunch")
    },
    system: {
        getOsInfo: () => ipcRenderer.invoke("system:get-os-info"),
        listProcesses: (filterExes: string[]) =>
            ipcRenderer.invoke("system:list-processes", filterExes)
    },
    shell: {
        openExternal: (url: string) =>
            ipcRenderer.invoke("shell:open-external", url)
    },
    storage: {
        getToken: () => ipcRenderer.invoke("storage:get-token"),
        setToken: (token: string) =>
            ipcRenderer.invoke("storage:set-token", token),
        deleteToken: () => ipcRenderer.invoke("storage:delete-token")
    },
    clipboard: {
        write: (text: string) => ipcRenderer.invoke("clipboard:write", text),
        read: () => ipcRenderer.invoke("clipboard:read")
    },
    desktop: {
        setAutostart: (enabled: boolean) =>
            ipcRenderer.invoke("desktop:set-autostart", enabled),
        getAutostart: () => ipcRenderer.invoke("desktop:get-autostart")
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
    codec: {
        etfEncode: (payload: any) =>
            ipcRenderer.invoke("codec:etf-encode", payload),
        etfDecode: (payload: number[]) =>
            ipcRenderer.invoke("codec:etf-decode", payload)
    },
    updater: {
        check: () => ipcRenderer.invoke("updater:check"),
        download: () => ipcRenderer.invoke("updater:download"),
        install: () => ipcRenderer.invoke("updater:install"),
        checkOnStartup: () => ipcRenderer.invoke("updater:check-on-startup")
    },
    events: {
        onDeepLink: (callback: (url: string) => void) => {
            ipcRenderer.on("deep-link", (_, url) => callback(url));
        },
        onUpdaterChecking: (callback: () => void) => {
            ipcRenderer.on("updater:checking", () => callback());
        },
        onUpdaterAvailable: (callback: (info: any) => void) => {
            ipcRenderer.on("updater:update-available", (_, info) =>
                callback(info)
            );
        },
        onUpdaterError: (callback: (error: string) => void) => {
            ipcRenderer.on("updater:error", (_, error) => callback(error));
        },
        onUpdaterProgress: (callback: (progress: any) => void) => {
            ipcRenderer.on("updater:download-progress", (_, progress) =>
                callback(progress)
            );
        },
        onUpdaterDownloaded: (callback: () => void) => {
            ipcRenderer.on("updater:update-downloaded", () => callback());
        },
        onUpdaterNotAvailable: (callback: () => void) => {
            ipcRenderer.on("updater:no-update", () => callback());
        }
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
