import { makeAutoObservable, observable } from "mobx";
import { GatewayStore } from "./Gateway.store";

export class AppStore {
    gatewayStore: GatewayStore;

    @observable token: string | null = null;

    constructor() {
        makeAutoObservable(this);
        this.gatewayStore = new GatewayStore(this);
    }
}

export const appStore = new AppStore();
