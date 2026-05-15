import { Logger } from "@mutualzz/logger";
import { makeAutoObservable } from "mobx";
import type { AppStore } from "@stores/App.store";

type UpdaterStage =
    | "idle"
    | "checking"
    | "downloading"
    | "ready"
    | "installing"
    | "relaunching"
    | "error";

interface UpdateInfo {
    version: string;
    releaseDate: string;
    releaseNotes: string;
}

interface UpdateProgress {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
}

interface CheckForUpdateOpts {
    isLaunchCheck?: boolean;
    forceOnLaunch?: boolean;
}

export class UpdaterStore {
    stage: UpdaterStage = "idle";
    downloadedBytes = 0;
    totalBytes = 0;
    error: string | null = null;
    showDownloadOverlay = true;
    forceUpdate = false;
    updateInfo: UpdateInfo | null = null;
    hasUpdate = false;

    private autoCheckTimer: ReturnType<typeof setInterval> | null = null;

    private readonly logger = new Logger({
        tag: "UpdaterStore"
    });

    constructor(private readonly app: AppStore) {
        makeAutoObservable(this);
        this.setupListeners();
    }

    get progress() {
        if (!this.totalBytes) return 0;
        return this.downloadedBytes / this.totalBytes;
    }

    debugSetForceGate(active: boolean) {
        if (!import.meta.env.DEV) return;
        this.forceUpdate = active;
        this.showDownloadOverlay = active;
    }

    debugSetStage(stage: UpdaterStage) {
        if (!import.meta.env.DEV) return;
        this.stage = stage;
    }

    async startAutoChecker() {
        if (!window.api) {
            this.logger.warn("API not available, skipping updater");
            return;
        }

        try {
            await window.api.updater.checkOnStartup();

            if (
                this.forceUpdate &&
                (this.stage === "downloading" ||
                    this.stage === "installing" ||
                    this.stage === "relaunching")
            ) {
                return;
            }

            this.setDownloadOverlay(false);

            if (this.autoCheckTimer) clearInterval(this.autoCheckTimer);

            // Check for updates every hour
            this.autoCheckTimer = setInterval(() => {
                void this.checkForUpdates({
                    isLaunchCheck: false,
                    forceOnLaunch: false
                });
            }, 36e5);
        } catch (err: any) {
            this.logger.error("Failed to start auto-checker:", err);
        }
    }

    async checkForUpdates(opts?: CheckForUpdateOpts) {
        if (!window.api) {
            this.logger.warn("API not available, skipping update check");
            return;
        }

        const isLaunchCheck = !!opts?.isLaunchCheck;

        this.setStage("checking");
        this.setError(null);

        try {
            if (isLaunchCheck) {
                await window.api.updater.checkOnStartup();
            } else {
                await window.api.updater.check();
            }
        } catch (err: any) {
            this.logger.error("Failed to check updates", err);
            this.setStage("error");
            this.setError(err?.message ?? String(err));
            this.app.setAppLoading(false);
        }
    }

    async installUpdate() {
        if (!this.updateInfo) {
            this.logger.error("Update not downloaded, cannot install");
            return;
        }

        if (!window.api) {
            this.logger.error("API not available, cannot install update");
            this.setStage("error");
            this.setError("API not available");
            return;
        }

        this.setStage("installing");
        this.setError(null);

        try {
            await window.api.updater.install();
            this.setStage("relaunching");
        } catch (err: any) {
            this.logger.error("Failed to install update", err);
            this.setStage("error");
            this.setError(err?.message ?? String(err));
        }
    }

    private setupListeners() {
        if (!window.api) return;

        window.api.events.onUpdaterChecking(() => {
            this.setStage("checking");
            this.setError(null);
        });

        window.api.events.onUpdaterAvailable((info: UpdateInfo) => {
            this.logger.info("Update available:", info.version);
            this.setUpdateInfo(info);
            this.setStage("downloading");
            void this.downloadUpdate();
        });

        // Ensure preload exposes this callback (see note below)
        window.api.events.onUpdaterNotAvailable(() => {
            this.setStage("idle");
            this.setForceUpdate(false);
            this.logger.debug("No new update found");
            this.app.setAppLoading(false);
        });

        window.api.events.onUpdaterError((error: string) => {
            this.logger.error("Update error:", error);
            this.setStage("error");
            this.setError(error);
            this.app.setAppLoading(false);
        });

        window.api.events.onUpdaterProgress((progress: UpdateProgress) => {
            this.setDownloadingProgress(progress.transferred, progress.total);
        });

        window.api.events.onUpdaterDownloaded(() => {
            this.logger.info("Update downloaded and ready to install");
            this.setStage("ready");
            this.app.setAppLoading(false);
        });
    }

    private async downloadUpdate() {
        if (!window.api) {
            this.logger.error("API not available, cannot download update");
            this.setStage("error");
            this.setError("API not available");
            return;
        }

        this.setStage("downloading");

        try {
            await window.api.updater.download();
        } catch (err: any) {
            this.logger.error("Failed to download update", err);
            this.setStage("error");
            this.setError(err?.message ?? String(err));
            this.app.setAppLoading(false);
        }
    }

    private setUpdateInfo(info: UpdateInfo) {
        this.updateInfo = info;
        this.hasUpdate = true;
    }

    private setForceUpdate(active: boolean) {
        this.forceUpdate = active;
    }

    private setStage(stage: UpdaterStage) {
        this.stage = stage;
    }

    private setError(error: string | null) {
        this.error = error;
    }

    private setDownloadOverlay(visible: boolean) {
        this.showDownloadOverlay = visible;
    }

    private setDownloadingProgress(downloaded: number, total: number) {
        this.downloadedBytes = downloaded;
        this.totalBytes = total;
    }
}
