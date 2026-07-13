import { Logger } from "@mutualzz/logger";
import { makeAutoObservable, runInAction } from "mobx";

type UpdaterStage =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "installing"
  | "error";

interface PlatformAsset {
  url: string;
  sha256: string;
}

interface LatestJson {
  version: string;
  win?: { x64?: PlatformAsset };
  osx?: { universal?: PlatformAsset };
  linux?: {
    debian?: PlatformAsset;
    appimage?: PlatformAsset;
    rpm?: PlatformAsset;
    pacman?: PlatformAsset;
  };
}

const LATEST_JSON_URL =
  "https://proxy.mutualzz.com/releases/latest/latest.json";
const CHECK_INTERVAL = import.meta.env.DEV ? 5 * 60 * 1000 : 60 * 60 * 1000;

export class UpdaterStore {
  stage: UpdaterStage = "idle";
  downloadedBytes = 0;
  totalBytes = 0;
  bytesPerSecond = 0;
  error: string | null = null;
  hasUpdate = false;
  updateVersion: string | null = null;
  updateFilePath: string | null = null;

  private autoCheckTimer: ReturnType<typeof setInterval> | null = null;
  private readonly logger = new Logger({ tag: "UpdaterStore" });

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get progress() {
    if (!this.totalBytes) return 0;
    return this.downloadedBytes / this.totalBytes;
  }

  get progressLabel() {
    const mb = (n: number) => (n / 1_048_576).toFixed(1);
    if (this.stage === "downloading") {
      if (this.totalBytes > 0) {
        const pct = Math.round(this.progress * 100);
        const eta =
          this.bytesPerSecond > 0
            ? formatEta(
                (this.totalBytes - this.downloadedBytes) / this.bytesPerSecond
              )
            : "";
        return `${pct}% · ${mb(this.downloadedBytes)}/${mb(this.totalBytes)} MB${eta ? ` · ${eta}` : ""}`;
      }
      return `${mb(this.downloadedBytes)} MB`;
    }
    if (this.stage === "ready" && this.updateVersion) {
      return `Update ${this.updateVersion} ready`;
    }
    if (this.stage === "installing") {
      return "Installing update…";
    }
    return "";
  }

  async startAutoChecker() {
    if (!window.api) return;

    await this.checkForUpdates();

    if (this.autoCheckTimer) clearInterval(this.autoCheckTimer);
    this.autoCheckTimer = setInterval(() => {
      void this.checkForUpdates();
    }, CHECK_INTERVAL);
  }

  async checkForUpdates() {
    this.setStage("checking");
    this.setError(null);

    try {
      const res = await fetch(LATEST_JSON_URL, {
        headers: { "Cache-Control": "no-cache" }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const latest: LatestJson = await res.json();
      const currentVersion = await window.api.updater.getVersion();

      if (!this.isNewerVersion(latest.version, currentVersion)) {
        this.logger.info("No update available");
        this.setStage("idle");
        return;
      }

      this.logger.info("Update available:", latest.version);

      runInAction(() => {
        this.hasUpdate = true;
        this.updateVersion = latest.version;
        this.setStage("downloading");
      });

      const asset = await this.getAssetForPlatform(latest);
      if (!asset) {
        throw new Error("No asset for current platform");
      }

      await this.downloadUpdate(asset, latest.version);
    } catch (err: any) {
      this.logger.error("Update check failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    }
  }

  async installUpdate() {
    if (!this.updateFilePath || !this.updateVersion) {
      this.logger.error("No update file path or version, cannot install");
      return;
    }

    if (!window.api) {
      this.setStage("error");
      this.setError("API not available");
      return;
    }

    this.setStage("installing");

    try {
      await window.api.updater.apply(this.updateFilePath, this.updateVersion);
    } catch (err: any) {
      this.logger.error("Install failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    }
  }

  private async downloadUpdate(asset: PlatformAsset, version: string) {
    this.logger.info("Downloading update from:", asset.url);

    const savePath = await window.api.updater.getSavePath(version, asset.url);

    const unsubscribe = window.api.events.onUpdaterDownloadProgress((data) => {
      runInAction(() => {
        this.downloadedBytes = data.downloaded;
        this.totalBytes = data.total;
        this.bytesPerSecond = data.bytesPerSecond ?? 0;
      });
    });

    try {
      const result = await window.api.updater.download(
        asset.url,
        savePath,
        asset.sha256
      );

      runInAction(() => {
        this.updateFilePath = result.path;
        this.setStage("ready");
      });

      this.logger.info("Update ready at:", result.path);
    } catch (err: any) {
      this.logger.error("Download failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    } finally {
      unsubscribe();
    }
  }

  private async getAssetForPlatform(
    latest: LatestJson
  ): Promise<PlatformAsset | null> {
    const platform = await window.api.updater.getPlatform();

    if (platform === "darwin") return latest.osx?.universal ?? null;
    if (platform === "win32") return latest.win?.x64 ?? null;
    if (platform === "linux") {
      const flavor = await window.api.updater.getLinuxPackage();
      return (
        latest.linux?.[flavor] ??
        latest.linux?.appimage ??
        latest.linux?.debian ??
        null
      );
    }

    return null;
  }

  private isNewerVersion(remote: string, current: string): boolean {
    const normalize = (v: string) => v.trim().replace(/^v/i, "");
    const parse = (v: string) => {
      const [core, ...preParts] = normalize(v).split("-");
      const nums = core.split(".").map((part) => {
        const n = parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
      });
      while (nums.length < 3) nums.push(0);
      return { nums: nums.slice(0, 3), pre: preParts.join("-") };
    };

    const r = parse(remote);
    const c = parse(current);

    for (let i = 0; i < 3; i++) {
      if (r.nums[i] !== c.nums[i]) return r.nums[i] > c.nums[i];
    }

    if (r.pre && !c.pre) return false;
    if (!r.pre && c.pre) return true;
    if (r.pre && c.pre) return r.pre > c.pre;
    return false;
  }

  private setStage(stage: UpdaterStage) {
    this.stage = stage;
  }

  private setError(error: string | null) {
    this.error = error;
  }
}

function formatEta(secs: number) {
  const s = Math.max(0, Math.round(secs));
  if (s < 60) return `${s}s left`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s left`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m left`;
}
