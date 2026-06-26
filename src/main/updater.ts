import { app, ipcMain } from "electron";
import { join } from "path";
import { spawn } from "child_process";
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { get as httpsGet } from "https";
import { get as httpGet } from "http";

export function initUpdaterHandlers() {
  ipcMain.handle("updater:get-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("updater:get-platform", () => {
    return process.platform;
  });

  ipcMain.handle("updater:get-save-path", (_event, version: string) => {
    const dir = join(app.getPath("temp"), "mutualzz-updates");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const ext =
      process.platform === "darwin"
        ? "dmg"
        : process.platform === "win32"
          ? "exe"
          : "AppImage";

    return join(dir, `Mutualzz-${version}.${ext}`);
  });

  ipcMain.handle(
    "updater:download",
    async (event, url: string, savePath: string) => {
      return new Promise<{ path: string }>((resolve, reject) => {
        const getter = url.startsWith("https") ? httpsGet : httpGet;

        // Delete stale file if exists
        if (existsSync(savePath)) {
          unlinkSync(savePath);
        }

        const file = createWriteStream(savePath);
        let downloaded = 0;
        let total = 0;

        getter(url, (res) => {
          total = parseInt(res.headers["content-length"] ?? "0", 10);

          res.on("data", (chunk: Buffer) => {
            downloaded += chunk.length;
            const percent = total > 0 ? (downloaded / total) * 100 : 0;
            event.sender.send("updater:download-progress", {
              percent,
              downloaded,
              total
            });
          });

          res.pipe(file);

          file.on("finish", () => {
            file.close();
            resolve({ path: savePath });
          });

          file.on("error", (err) => {
            file.close();
            reject(err);
          });
        }).on("error", reject);
      });
    }
  );

  ipcMain.handle(
    "updater:apply",
    async (_event, updatePath: string, version: string) => {
      const updaterPath = getUpdaterPath();

      const child = spawn(
        updaterPath,
        ["--apply", updatePath, "--version", version],
        {
          detached: true,
          stdio: "ignore"
        }
      );

      await new Promise<void>((resolve, reject) => {
        child.on("spawn", () => {
          child.unref();
          resolve();
        });
        child.on("error", reject);
      });

      app.quit();
    }
  );
}

function getUpdaterPath(): string {
  if (process.platform === "darwin") {
    return join(process.execPath, "..", "Mutualzz");
  }
  if (process.platform === "win32") {
    return join(process.execPath, "..", "updater.exe");
  }
  return join(process.execPath, "..", "updater");
}
