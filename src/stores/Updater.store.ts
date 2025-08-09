import { Logger } from "@logger";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { makeAutoObservable } from "mobx";

export class UpdaterStore {
    private readonly logger = new Logger({
        tag: "UpdaterStore",
    });

    initialized = false;
    enabled = true;
    checkingForUpdates = false;
    updateDownloading = false;
    updateDownloaded = false;
    updateAvailable = false;

    timer: NodeJS.Timeout | null = null;

    constructor() {
        this.logger.debug("Initializing UpdaterStore");

        const setupListeners = async () => {
            await listen("CHECKING_FOR_UPDATE", () => {
                this.logger.debug("Checking for updates");
                this.setCheckingForUpdates(true);
                this.setUpdateAvailable(false);
                this.setUpdateDownloading(false);
                this.setUpdateDownloaded(false);
            });

            await listen("UPDATE_AVAILABLE", () => {
                this.logger.debug("Update available");
                this.setCheckingForUpdates(false);
                this.setUpdateAvailable(true);
                this.setUpdateDownloading(false);
                this.setUpdateDownloaded(false);
            });

            await listen("UPDATE_NOT_AVAILABLE", () => {
                this.logger.debug("Update not available");
                this.setCheckingForUpdates(false);
                this.setUpdateAvailable(false);
                this.setUpdateDownloading(false);
                this.setUpdateDownloaded(false);
            });

            await listen("UPDATE_DOWNLOADING", () => {
                this.logger.debug("Update downloading");
                this.setCheckingForUpdates(false);
                this.setUpdateAvailable(false);
                this.setUpdateDownloading(true);
                this.setUpdateDownloaded(false);
            });

            await listen("UPDATE_DOWNLOADED", () => {
                this.logger.debug("Update downloaded");
                this.setCheckingForUpdates(false);
                this.setUpdateAvailable(false);
                this.setUpdateDownloading(false);
                this.setUpdateDownloaded(true);
            });

            await listen("UPDATE_ERROR", (e) => {
                this.logger.debug("Update error", e);
                this.setCheckingForUpdates(false);
                this.setUpdateAvailable(false);
                this.setUpdateDownloading(false);
                this.setUpdateDownloaded(false);
            });
        };

        setupListeners();

        window.updater = {
            setUpdateAvailable: this.setUpdateAvailable.bind(this),
            setUpdateDownloading: this.setUpdateDownloading.bind(this),
            setUpdateDownloaded: this.setUpdateDownloaded.bind(this),
            setCheckingForUpdates: this.setCheckingForUpdates.bind(this),
            checkForUpdates: this.checkForUpdates.bind(this),
            downloadUpdate: this.downloadUpdate.bind(this),
            quitAndInstall: this.quitAndInstall.bind(this),
            clearUpdateCache: this.clearCache.bind(this),
        };

        makeAutoObservable(this);
    }

    setCheckingForUpdates(checking: boolean) {
        this.checkingForUpdates = checking;
    }

    setUpdateAvailable(available: boolean) {
        this.updateAvailable = available;
    }

    setUpdateDownloading(downloading: boolean) {
        this.updateDownloading = downloading;
    }

    setUpdateDownloaded(downloaded: boolean) {
        this.updateDownloaded = downloaded;
    }

    async checkForUpdates() {
        if (this.checkingForUpdates) {
            this.logger.warn(
                "Already checking for updates, skipping new check",
            );
            return;
        }

        this.logger.debug("Invoking check for updates");
        await invoke("check_for_updates", { ignorePreleases: false });
    }

    async downloadUpdate() {
        if (this.updateDownloading) {
            this.logger.warn("Already downloading an update");
            return;
        }

        if (this.updateDownloaded) {
            this.logger.warn("An update is already pending installation");
            return;
        }

        this.logger.debug("Invoking update download");
        await invoke("download_update");
    }

    async quitAndInstall() {
        if (!this.updateDownloaded) {
            this.logger.warn("No update is pending installation");
            return;
        }

        this.logger.debug("Invoking update install");
        await invoke("install_update");
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;

        if (enabled) this.enable();
        else this.disable();
    }

    async enable() {
        this.logger.debug("Enabling updater");

        if (this.initialized) {
            this.logger.warn("Updater is already enabled");
            return;
        }

        await this.checkForUpdates();

        this.timer = setInterval(async () => {
            this.logger.debug("[UpdateTimer] Checking for updates");
            await this.checkForUpdates();
        }, 36e5);

        this.initialized = true;
    }

    disable() {
        this.logger.debug("Disabling updater");
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async clearCache() {
        this.logger.debug("Clearing update cache");
        await invoke("clear_update_cache");
    }
}
