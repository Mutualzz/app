import type { APIUser } from "@mutualzz/types";
import { isSSR } from "@utils/index";
import REST from "@utils/REST";
import { secureStorageAdapter } from "@utils/secureStorageAdapter";
import { Logger } from "Logger";
import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";
import secureLocalStorage from "react-secure-storage";
import { AccountStore } from "./Account.store";
import { GatewayStore } from "./Gateway.store";
import { ThemeStore } from "./Theme.store";

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

    constructor() {
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
    }

    loadSettings() {
        this.theme.loadDefaultThemes();
        this.loadToken();
    }
}
