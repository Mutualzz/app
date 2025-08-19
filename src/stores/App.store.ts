import { Logger } from "@logger";
import type { APIUser } from "@mutualzz/types";
import { isSSR, isTauri } from "@utils/index";
import REST from "@utils/REST";
import { secureStorageAdapter } from "@utils/secureStorageAdapter";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import secureLocalStorage from "react-secure-storage";
import { AccountStore } from "./Account.store";
import { GatewayStore } from "./Gateway.store";
import { ThemeStore } from "./Theme.store";
import { UpdaterStore } from "./Updater.store";

export class AppStore {
    private readonly logger = new Logger({
        tag: "AppStore",
    });

    isGatewayReady = false;
    isAppLoading = true;

    token: string | null = null;

    account: AccountStore | null = null;
    gateway = new GatewayStore(this);
    theme = new ThemeStore();
    rest = new REST();
    updaterStore: UpdaterStore | null = null;

    constructor() {
        if (isTauri) {
            this.updaterStore = new UpdaterStore();
        }

        makeAutoObservable(this);

        if (isSSR) return;

        makePersistable(this, {
            name: "AppStore",
            properties: ["token"],
            storage: secureStorageAdapter,
        });
    }

    setUser(user: APIUser) {
        this.account = new AccountStore(user);
        this.theme.loadUserThemes(user);
    }

    setGatewayReady(ready: boolean) {
        this.isGatewayReady = ready;
    }

    setAppLoading(loading: boolean) {
        this.isAppLoading = loading;
    }

    get isReady() {
        return !this.isAppLoading && this.isGatewayReady;
    }

    setToken(token: string) {
        this.token = token;
        this.logger.debug("Token saved to the storage");
    }

    loadToken() {
        if (this.token) {
            this.setToken(this.token);
            this.logger.debug("Token loaded from the storage");
        } else {
            this.logger.warn("No token found in the storage");
            this.setGatewayReady(true);
        }
    }

    logout() {
        this.token = null;
        this.isAppLoading = false;
        this.isGatewayReady = true;
        this.account = null;
        this.rest.setToken(null);
        secureLocalStorage.clear();
        this.theme.reset();
    }

    setUpdaterEnabled(value: boolean) {
        this.updaterStore?.setEnabled(value);
        secureLocalStorage.setItem("updaterEnabled", String(value));
    }

    loadUpdaterEnabled() {
        this.updaterStore?.setEnabled(
            (secureStorageAdapter.getItem("updaterEnabled") as
                | boolean
                | null) ?? true,
        );
    }

    loadSettings() {
        this.loadToken();
        this.theme.loadDefaultThemes();
        this.loadUpdaterEnabled();
    }
}
