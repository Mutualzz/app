import { Logger } from "@mutualzz/logger";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { makeAutoObservable } from "mobx";

type UpdaterStage =
    | "idle"
    | "checking"
    | "downloading"
    | "ready"
    | "installing"
    | "relaunching"
    | "error";

interface CheckForUpdateOpts {
    isLaunchCheck?: boolean;
    forceOnLaunch?: boolean;
}

export class UpdaterStore {
    update: Update | null = null;
    interval: NodeJS.Timeout | null = null;
    stage: UpdaterStage = "idle";
    downloadedBytes = 0;
    totalBytes?: number = 0;
    error: string | null = null;
    showDownloadOverlay = true;
    forceUpdate = false;
    private readonly logger = new Logger({
        tag: "UpdaterStore",
    });

    constructor() {
        makeAutoObservable(this);
    }

    get progress() {
        if (!this.totalBytes) return 0;
        return this.downloadedBytes / this.totalBytes;
    }

    private get forceEnabled() {
        return !import.meta.env.DEV;
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
        if (this.interval) return;

        await this.checkForUpdates({
            isLaunchCheck: true,
            forceOnLaunch: this.forceEnabled,
        });

        if (
            this.forceUpdate &&
            (this.stage === "downloading" ||
                this.stage === "installing" ||
                this.stage === "relaunching")
        ) {
            return;
        }

        this.setDownloadOverlay(false);
        this.interval = setInterval(() => {
            this.checkForUpdates({
                isLaunchCheck: false,
                forceOnLaunch: false,
            });
        }, 36e5); // Check every hour
    }

    stopAutoChecker() {
        if (!this.interval) return;

        clearInterval(this.interval);
        this.interval = null;
    }

    async checkForUpdates(opts?: CheckForUpdateOpts) {
        const isLaunchCheck = !!opts?.isLaunchCheck;
        const forceOnLaunch =
            this.forceEnabled && !!opts?.forceOnLaunch && isLaunchCheck;

        this.setStage("checking");
        this.setError(null);

        try {
            const update = await check();

            if (!update) {
                this.setStage("idle");
                this.setForceUpdate(false);
                this.logger.debug("No new update found");
                return;
            }

            this.logger.debug("New update found");

            if (forceOnLaunch) {
                this.setDownloadOverlay(true);
                this.setForceUpdate(true);
                this.setStage("downloading");
            } else {
                this.setForceUpdate(false);
                this.setDownloadOverlay(false);
            }

            await update.download((e) => {
                if (e.event === "Started") {
                    this.logger.debug("Downloading the update");
                    this.setDownloadingProgress(0, e.data.contentLength);
                }

                if (e.event === "Progress") {
                    this.setDownloadingProgress(
                        this.downloadedBytes + e.data.chunkLength,
                        this.totalBytes,
                    );
                }

                if (e.event === "Finished") {
                    this.logger.debug("Downloading the update finished");
                }
            });

            this.setUpdate(update);

            this.setStage("ready");

            if (forceOnLaunch) {
                await this.installUpdate();
            }
        } catch (err: any) {
            this.logger.error("Failed to check/download updates", err);
            this.setStage("error");
            this.setError(err?.message ?? String(err));
        }
    }

    async installUpdate() {
        if (!this.update) {
            this.logger.error(
                "Update has not been downloaded yet, not installing...",
            );
            return;
        }

        this.setStage("installing");
        this.setError(null);

        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        await this.update.install();
        this.setStage("relaunching");
        await relaunch();
    }

    private setForceUpdate(active: boolean) {
        this.forceUpdate = active;
    }

    private setUpdate(update: Update | null) {
        this.update = update;
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

    private setDownloadingProgress(downloaded: number, total?: number) {
        this.downloadedBytes = downloaded;
        this.totalBytes = total;
    }
}
