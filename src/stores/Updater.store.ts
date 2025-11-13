import { Logger } from "@mutualzz/logger";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { makeAutoObservable } from "mobx";

export class UpdaterStore {
    private readonly logger = new Logger({
        tag: "UpdaterStore",
    });

    checking = false;
    update: Update | null = null;
    interval: NodeJS.Timeout | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    async startAutoChecker() {
        if (this.interval) return;

        await this.checkForUpdates();
        this.interval = setInterval(() => {
            this.checkForUpdates();
        }, 36e5); // Check every hour
    }

    stopAutoChecker() {
        if (!this.interval) return;

        clearInterval(this.interval);
        this.interval = null;
    }

    async checkForUpdates() {
        this.setChecking(true);

        try {
            const update = await check();
            if (update) {
                this.logger.debug("New update found");
                await update.download((event) => {
                    if (event.event === "Started") {
                        this.logger.debug("Downloading the update");
                    }
                    if (event.event === "Finished") {
                        this.logger.debug("Downloading the update finished");
                    }
                });

                this.setDownloadedUpdate(update);
            } else {
                this.logger.debug("No new update found");
            }
        } catch (err) {
            this.logger.error("Failed to check for updates", err);
        } finally {
            this.setChecking(false);
        }
    }

    setDownloadedUpdate(update: Update) {
        this.update = update;
    }

    async installUpdate() {
        if (!this.update) {
            this.logger.error(
                "Update has not been downloaded yet, not installing...",
            );
            return;
        }

        await this.update.install();
        await relaunch();
    }

    setChecking(value: boolean) {
        this.checking = value;
    }
}
