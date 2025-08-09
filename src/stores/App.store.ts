import type { APIUser } from "@mutualzz/types";
import REST from "@utils/REST";
import { Logger } from "Logger";
import { makeAutoObservable } from "mobx";
import secureLocalStorage from "react-secure-storage";
import { AccountStore } from "./Account.store";
import { GatewayStore } from "./Gateway.store";

export class AppStore {
    private readonly logger = new Logger({
        tag: "AppStore",
    });

    isGatewayReady = false;
    isAppLoading = true;

    token: string | null = null;

    account: AccountStore | null = null;
    gateway: GatewayStore = new GatewayStore(this);
    rest = new REST();

    constructor() {
        makeAutoObservable(this);
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
        secureLocalStorage.setItem("token", token);
        this.logger.debug("Token saved to the storage");
    }

    loadToken() {
        const token = secureLocalStorage.getItem("token") as string | null;

        if (token) {
            this.setToken(token);
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
        secureLocalStorage.clear();
    }

    loadSettings() {
        this.loadToken();
    }
}
