import { Logger } from "@mutualzz/logger";
import i18n from "@renderer/i18n";
import { makeAutoObservable, runInAction } from "mobx";

type UpdaterStage =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "restarting"
  | "error";

interface AsarAsset {
  url: string;
  sha256: string;
}

interface PlatformAsset {
  url: string;
  sha256: string;
  packageUrl?: string;
  packageSha256?: string;
  setupUrl?: string;
  setupSha256?: string;
  updaterVersion?: string;
  electronVersion?: string;
  asar?: AsarAsset;
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

  private pendingAsset: PlatformAsset | null = null;
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
        return i18n.t("updater.downloadProgress", {
          pct,
          downloaded: mb(this.downloadedBytes),
          total: mb(this.totalBytes),
          eta: eta ? ` · ${eta}` : ""
        });
      }
      return i18n.t("updater.downloadedOnly", {
        downloaded: mb(this.downloadedBytes)
      });
    }
    if (this.stage === "ready" && this.updateVersion) {
      return i18n.t("updater.updateReady", { version: this.updateVersion });
    }
    if (this.stage === "restarting") {
      return i18n.t("updater.restarting");
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

  stopAutoChecker() {
    if (this.autoCheckTimer) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
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
      const asset = await this.getAssetForPlatform(latest);

      if (!this.isNewerVersion(latest.version, currentVersion)) {
        if (asset && (await this.isUpdaterStale(asset))) {
          this.logger.info(
            "App version current but updater version outdated — forcing full package"
          );
          runInAction(() => {
            this.hasUpdate = true;
            this.updateVersion = latest.version;
            this.updateFilePath = null;
            this.pendingAsset = asset;
            this.downloadedBytes = 0;
            this.totalBytes = 0;
            this.bytesPerSecond = 0;
            this.setStage("downloading");
          });
          await this.downloadUpdate(asset, latest.version);
          return;
        }

        this.logger.info("No update available");
        this.clearPendingUpdate();
        this.setStage("idle");
        return;
      }

      this.logger.info("Update available:", latest.version);

      runInAction(() => {
        this.hasUpdate = true;
        this.updateVersion = latest.version;
        this.updateFilePath = null;
        this.pendingAsset = asset;
        this.downloadedBytes = 0;
        this.totalBytes = 0;
        this.bytesPerSecond = 0;
        this.setStage("downloading");
      });

      if (!asset) {
        throw new Error("No asset for current platform");
      }

      await this.downloadUpdate(asset, latest.version);
    } catch (err: any) {
      this.logger.error("Update check failed:", err);
      this.clearPendingUpdate();
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    }
  }

  async restartForUpdate() {
    if (!this.updateFilePath || !this.updateVersion) {
      this.logger.error("No update file path or version, cannot restart");
      return;
    }

    if (!window.api) {
      this.setStage("error");
      this.setError("API not available");
      return;
    }

    this.setStage("restarting");
    this.hasUpdate = false;

    try {
      await window.api.updater.restartForUpdate(
        this.updateFilePath,
        this.updateVersion,
        this.pendingAsset?.electronVersion,
        this.pendingAsset?.updaterVersion
      );
    } catch (err: any) {
      this.logger.error("Restart for update failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    }
  }

  private async isUpdaterStale(asset: PlatformAsset): Promise<boolean> {
    if (!asset.updaterVersion) return false;
    const local = await window.api.updater.getUpdaterVersion();
    if (!local) return true;
    return local.trim() !== asset.updaterVersion.trim();
  }

  private async resolveDownloadTarget(
    asset: PlatformAsset,
    platform: string,
    linuxFlavor: string
  ): Promise<{ url: string; sha256: string } | null> {
    if (asset.packageUrl && asset.packageSha256) {
      return { url: asset.packageUrl, sha256: asset.packageSha256 };
    }

    if (platform === "darwin") {
      return null;
    }

    const localElectron = await window.api.updater.getElectronVersion();
    const canUseAsar =
      asset.asar &&
      asset.electronVersion &&
      localElectron &&
      localElectron.trim() === asset.electronVersion.trim() &&
      linuxFlavor !== "appimage" &&
      platform === "linux";

    if (canUseAsar && asset.asar) {
      return { url: asset.asar.url, sha256: asset.asar.sha256 };
    }

    if (platform !== "linux" || linuxFlavor === "appimage") {
      return { url: asset.url, sha256: asset.sha256 };
    }

    return null;
  }

  private async downloadUpdate(asset: PlatformAsset, version: string) {
    const platform = await window.api.updater.getPlatform();
    const linuxFlavor =
      platform === "linux" ? await window.api.updater.getLinuxPackage() : "";

    const target = await this.resolveDownloadTarget(asset, platform, linuxFlavor);
    if (!target) {
      throw new Error(
        "Full update requires the AppImage build. Download from mutualzz.com."
      );
    }

    this.logger.info("Downloading update from:", target.url);

    const savePath = await window.api.updater.getSavePath(version, target.url);

    const unsubscribe = window.api.events.onUpdaterDownloadProgress((data) => {
      runInAction(() => {
        this.downloadedBytes = data.downloaded;
        this.totalBytes = data.total;
        this.bytesPerSecond = data.bytesPerSecond ?? 0;
      });
    });

    try {
      const result = await window.api.updater.download(
        target.url,
        savePath,
        target.sha256
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
      throw err;
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

  private clearPendingUpdate() {
    this.hasUpdate = false;
    this.updateVersion = null;
    this.updateFilePath = null;
    this.pendingAsset = null;
    this.downloadedBytes = 0;
    this.totalBytes = 0;
    this.bytesPerSecond = 0;
  }
}

function formatEta(secs: number) {
  const s = Math.max(0, Math.round(secs));
  if (s < 60) return i18n.t("updater.etaSeconds", { seconds: s });
  if (s < 3600) {
    return i18n.t("updater.etaMinutesSeconds", {
      minutes: Math.floor(s / 60),
      seconds: s % 60
    });
  }
  return i18n.t("updater.etaHoursMinutes", {
    hours: Math.floor(s / 3600),
    minutes: Math.floor((s % 3600) / 60)
  });
}
