import { Logger } from "@mutualzz/logger";
import { makeAutoObservable, runInAction } from "mobx";
import type { AppStore } from "@stores/App.store";

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
  linux?: { debian?: PlatformAsset; appimage?: PlatformAsset };
}

const LATEST_JSON_URL =
  "https://proxy.mutualzz.com/releases/latest/latest.json";

export class UpdaterStore {
  stage: UpdaterStage = "idle";
  downloadedBytes = 0;
  totalBytes = 0;
  error: string | null = null;
  hasUpdate = false;
  updateVersion: string | null = null;
  updateFilePath: string | null = null;

  private autoCheckTimer: ReturnType<typeof setInterval> | null = null;
  private readonly logger = new Logger({ tag: "UpdaterStore" });

  constructor(private readonly app: AppStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get progress() {
    if (!this.totalBytes) return 0;
    return this.downloadedBytes / this.totalBytes;
  }

  async startAutoChecker() {
    if (!window.api) return;

    await this.checkForUpdates();

    if (this.autoCheckTimer) clearInterval(this.autoCheckTimer);
    this.autoCheckTimer = setInterval(() => {
      void this.checkForUpdates();
    }, 36e5); // every hour
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
      const currentVersion = await window.api.app.getVersion();

      if (!this.isNewerVersion(latest.version, currentVersion)) {
        this.logger.info("No update available");
        this.setStage("idle");
        this.app.setAppLoading(false);
        return;
      }

      this.logger.info("Update available:", latest.version);

      runInAction(() => {
        this.hasUpdate = true;
        this.updateVersion = latest.version;
        this.setStage("downloading");
      });

      const asset = await this.getAssetForPlatform(latest);
      if (!asset) throw new Error("No asset for current platform");

      await this.downloadUpdate(asset, latest.version);
    } catch (err: any) {
      this.logger.error("Update check failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
      this.app.setAppLoading(false);
    }
  }

  async installUpdate() {
    if (!this.updateFilePath) {
      this.logger.error("No update file path, cannot install");
      return;
    }

    if (!window.api) {
      this.setStage("error");
      this.setError("API not available");
      return;
    }

    this.setStage("installing");

    try {
      await window.api.updater.apply(this.updateFilePath);
    } catch (err: any) {
      this.logger.error("Install failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
    }
  }

  private async downloadUpdate(asset: PlatformAsset, version: string) {
    this.logger.info("Downloading update from:", asset.url);

    const savePath = await window.api.updater.getSavePath(version);

    try {
      const result = await window.api.updater.download(asset.url, savePath);

      runInAction(() => {
        this.updateFilePath = result.path;
        this.setStage("ready");
      });

      this.app.setAppLoading(false);
      this.logger.info("Update ready at:", result.path);
    } catch (err: any) {
      this.logger.error("Download failed:", err);
      this.setStage("error");
      this.setError(err?.message ?? String(err));
      this.app.setAppLoading(false);
    }
  }

  private async getAssetForPlatform(
    latest: LatestJson
  ): Promise<PlatformAsset | null> {
    const platform = await window.api.updater.getPlatform();

    if (platform === "darwin") return latest.osx?.universal ?? null;
    if (platform === "win32") return latest.win?.x64 ?? null;
    if (platform === "linux")
      return latest.linux?.debian ?? latest.linux?.appimage ?? null;

    return null;
  }

  private isNewerVersion(remote: string, current: string): boolean {
    const parse = (v: string) => v.split(".").map(Number);
    const [rMaj, rMin, rPat] = parse(remote);
    const [cMaj, cMin, cPat] = parse(current);

    if (rMaj !== cMaj) return rMaj > cMaj;
    if (rMin !== cMin) return rMin > cMin;
    return rPat > cPat;
  }

  private setStage(stage: UpdaterStage) {
    this.stage = stage;
  }

  private setError(error: string | null) {
    this.error = error;
  }
}
