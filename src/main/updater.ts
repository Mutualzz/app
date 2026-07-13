import { app, ipcMain } from "electron";
import { createHash, Hash } from "crypto";
import { join, resolve, sep } from "path";
import { spawn } from "child_process";
import {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
  unlinkSync,
  renameSync,
  readFileSync,
  readdirSync
} from "fs";
import { get as httpsGet, RequestOptions } from "https";
import { IncomingMessage } from "http";
import { URL } from "url";

const ALLOWED_HOSTS = new Set(["proxy.mutualzz.com"]);
const MAX_REDIRECTS = 5;

export function initUpdaterHandlers() {
  ipcMain.handle("updater:get-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("updater:get-platform", () => {
    return process.platform;
  });

  ipcMain.handle("updater:get-linux-package", () => {
    return detectLinuxPackage();
  });

  ipcMain.handle(
    "updater:get-save-path",
    (_event, version: string, url: string) => {
      const dir = updatesDir();
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const fromUrl = extensionFromUrl(url);
      const ext =
        fromUrl ||
        (process.platform === "darwin"
          ? "dmg"
          : process.platform === "win32"
            ? "exe"
            : "AppImage");

      return join(dir, `Mutualzz-${version}.${ext}`);
    }
  );

  ipcMain.handle(
    "updater:download",
    async (event, url: string, savePath: string, sha256: string) => {
      assertAllowedUrl(url);
      assertAllowedSavePath(savePath);

      if (!sha256 || typeof sha256 !== "string") {
        throw new Error("Missing sha256 for update download");
      }

      const expected = sha256.trim().toLowerCase();
      const partialPath = `${savePath}.partial`;

      if (existsSync(savePath)) unlinkSync(savePath);

      let hasher: Hash = createHash("sha256");
      let downloaded = 0;

      if (existsSync(partialPath)) {
        try {
          const existing = await hashFile(partialPath, hasher);
          if (existing > 0) {
            downloaded = existing;
          } else {
            unlinkSync(partialPath);
            hasher = createHash("sha256");
          }
        } catch {
          try {
            unlinkSync(partialPath);
          } catch {
            /* ignore */
          }
          hasher = createHash("sha256");
          downloaded = 0;
        }
      }

      return new Promise<{ path: string }>((resolvePromise, reject) => {
        let settled = false;

        const fail = (err: Error) => {
          if (settled) return;
          settled = true;
          reject(err);
        };

        const succeed = () => {
          if (settled) return;
          settled = true;
          try {
            renameSync(partialPath, savePath);
            cleanupUpdateDir(savePath);
            resolvePromise({ path: savePath });
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        };

        const request = (
          currentUrl: string,
          redirectsLeft: number,
          rangeStart: number
        ) => {
          let parsed: URL;
          try {
            parsed = new URL(currentUrl);
          } catch {
            fail(new Error("Invalid update URL"));
            return;
          }

          if (parsed.protocol !== "https:") {
            fail(new Error("Update downloads must use HTTPS"));
            return;
          }

          if (!ALLOWED_HOSTS.has(parsed.hostname)) {
            fail(new Error(`Update host not allowed: ${parsed.hostname}`));
            return;
          }

          const headers: Record<string, string> = {};
          if (rangeStart > 0) {
            headers.Range = `bytes=${rangeStart}-`;
          }

          const options: RequestOptions = {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            port: parsed.port || undefined,
            path: `${parsed.pathname}${parsed.search}`,
            method: "GET",
            headers
          };

          httpsGet(options, (res: IncomingMessage) => {
            const status = res.statusCode ?? 0;

            if (
              status >= 300 &&
              status < 400 &&
              res.headers.location &&
              redirectsLeft > 0
            ) {
              const next = new URL(res.headers.location, currentUrl).toString();
              res.resume();
              request(next, redirectsLeft - 1, rangeStart);
              return;
            }

            let append = rangeStart > 0 && status === 206;

            if (rangeStart > 0 && status === 200) {
              try {
                if (existsSync(partialPath)) unlinkSync(partialPath);
              } catch {
                /* ignore */
              }
              hasher = createHash("sha256");
              downloaded = 0;
              append = false;
            } else if (status < 200 || status >= 300) {
              res.resume();
              fail(new Error(`HTTP ${status}`));
              return;
            }

            const contentLength = parseInt(
              res.headers["content-length"] ?? "0",
              10
            );
            const total =
              status === 206 && contentLength > 0
                ? downloaded + contentLength
                : contentLength > 0
                  ? contentLength
                  : 0;

            const startedAt = Date.now();
            const startedBytes = downloaded;
            const file = createWriteStream(partialPath, {
              flags: append ? "a" : "w"
            });

            res.on("data", (chunk: Buffer) => {
              hasher.update(chunk);
              downloaded += chunk.length;
              const percent = total > 0 ? (downloaded / total) * 100 : 0;
              const elapsed = Math.max((Date.now() - startedAt) / 1000, 0.001);
              const bps = (downloaded - startedBytes) / elapsed;
              event.sender.send("updater:download-progress", {
                percent,
                downloaded,
                total,
                bytesPerSecond: bps
              });
            });

            res.pipe(file);

            file.on("finish", () => {
              file.close((err) => {
                if (err) {
                  fail(err);
                  return;
                }

                const actual = hasher.digest("hex");
                if (actual !== expected) {
                  try {
                    if (existsSync(partialPath)) unlinkSync(partialPath);
                  } catch {
                    /* ignore */
                  }
                  fail(
                    new Error(
                      `Checksum mismatch: expected ${expected}, got ${actual}`
                    )
                  );
                  return;
                }

                succeed();
              });
            });

            file.on("error", (err) => {
              file.destroy();
              fail(err);
            });

            res.on("error", fail);
          }).on("error", fail);
        };

        request(url, MAX_REDIRECTS, downloaded);
      });
    }
  );

  ipcMain.handle(
    "updater:apply",
    async (_event, updatePath: string, version: string) => {
      assertAllowedSavePath(updatePath);

      const updaterPath = getUpdaterPath();
      if (!existsSync(updaterPath)) {
        throw new Error(`Updater binary not found: ${updaterPath}`);
      }

      const child = spawn(
        updaterPath,
        ["--apply", updatePath, "--version", version],
        { detached: true, stdio: "ignore" }
      );

      await new Promise<void>((resolvePromise, reject) => {
        child.on("spawn", () => {
          child.unref();
          resolvePromise();
        });
        child.on("error", (err) => {
          reject(err);
        });
      });

      app.quit();
    }
  );
}

function updatesDir() {
  return join(app.getPath("temp"), "mutualzz-updates");
}

function cleanupUpdateDir(keepPath: string) {
  const dir = updatesDir();
  if (!existsSync(dir)) return;
  try {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (full === keepPath || full === `${keepPath}.partial`) continue;
      try {
        unlinkSync(full);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

function hashFile(path: string, hasher: Hash): Promise<number> {
  return new Promise((resolve, reject) => {
    let total = 0;
    const stream = createReadStream(path);
    stream.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      hasher.update(buf);
      total += buf.length;
    });
    stream.on("end", () => resolve(total));
    stream.on("error", reject);
  });
}

function assertAllowedSavePath(savePath: string) {
  const allowedRoot = resolve(updatesDir());
  const resolved = resolve(savePath);
  if (resolved !== allowedRoot && !resolved.startsWith(allowedRoot + sep)) {
    throw new Error("Update path is outside the allowed directory");
  }
}

function assertAllowedUrl(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("Update downloads must use HTTPS");
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Update host not allowed: ${parsed.hostname}`);
  }
}

function extensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop() ?? "";
    const dot = base.lastIndexOf(".");
    if (dot <= 0) return null;
    return base.slice(dot + 1);
  } catch {
    return null;
  }
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

function detectLinuxPackage(): "appimage" | "debian" | "rpm" | "pacman" {
  if (process.platform !== "linux") return "appimage";
  if (process.env.APPIMAGE) return "appimage";

  let osRelease = "";
  try {
    osRelease = readFileSync("/etc/os-release", "utf8");
  } catch {
    return "appimage";
  }

  let id = "";
  let idLike = "";
  for (const line of osRelease.split("\n")) {
    if (line.startsWith("ID=")) id = line.slice(3).replace(/"/g, "").toLowerCase();
    if (line.startsWith("ID_LIKE="))
      idLike = line.slice(8).replace(/"/g, "").toLowerCase();
  }

  const haystack = `${id} ${idLike}`;

  const archIds = [
    "arch",
    "archarm",
    "manjaro",
    "endeavouros",
    "garuda",
    "cachyos",
    "artix",
    "archcraft",
    "arcolinux"
  ];
  if (archIds.includes(id) || haystack.includes("arch")) return "pacman";

  const rpmIds = [
    "fedora",
    "rhel",
    "centos",
    "rocky",
    "almalinux",
    "ol",
    "opensuse",
    "opensuse-tumbleweed",
    "opensuse-leap",
    "sles",
    "mageia",
    "nobara"
  ];
  if (
    rpmIds.includes(id) ||
    haystack.split(/\s+/).some((token) =>
      ["fedora", "rhel", "centos", "suse"].includes(token)
    )
  ) {
    return "rpm";
  }

  const debianIds = [
    "debian",
    "ubuntu",
    "linuxmint",
    "pop",
    "elementary",
    "zorin",
    "kali",
    "raspbian",
    "neon",
    "tails"
  ];
  if (
    debianIds.includes(id) ||
    haystack.includes("debian") ||
    haystack.includes("ubuntu")
  ) {
    return "debian";
  }

  return "appimage";
}
