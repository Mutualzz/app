import { Logger } from "@logger";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { makeAutoObservable } from "mobx";

export class UpdaterStore {
    private readonly logger = new Logger({
        tag: "UpdaterStore",
    });

    checking = false;
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
                await update.downloadAndInstall((event) => {
                    if (event.event === "Started") {
                        this.logger.debug("Update started");
                    }
                    if (event.event === "Finished") {
                        this.logger.debug("Update finished");
                    }
                });

                if (import.meta.env.DEV)
                    this.logger.debug(
                        "Update downloaded in dev mode, skipping relaunch",
                    );
                else await relaunch();
            } else {
                this.logger.debug("No new update found");
            }
        } catch (err) {
            this.logger.error("Failed to check for updates", err);
        } finally {
            this.setChecking(false);
        }
    }

    setChecking(value: boolean) {
        this.checking = value;
    }
}
