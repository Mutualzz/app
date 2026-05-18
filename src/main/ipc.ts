import { app, ipcMain } from "electron";
import { trayManager } from "./tray";
import { getMainWindow } from "./windows";
import keytar from "keytar";
import { promises as fsPromises } from "fs";
import path from "path";

const SERVICE = "mutualzz";
const ACCOUNT = "default";

export function setupIPC(): void {
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
            const { execSync } = await import("child_process");

            if (process.platform === "win32") {
                const output = execSync("tasklist /nh /fo csv", {
                    encoding: "utf-8"
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
            const output = execSync("ps aux", { encoding: "utf-8" });
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
            let fullPath: string;

            if (app.isPackaged) {
                fullPath = path.join(process.resourcesPath, relativePath);
            } else {
                fullPath = path.join(
                    __dirname,
                    "..",
                    "..",
                    "resources",
                    relativePath
                );
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
            console.error("theme:read-icon failed:", err);
            return null;
        }
    });
}
