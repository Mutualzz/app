import { GatewayStore } from "./Gateway.store";

export class AppStore {
    gatewayStore: GatewayStore;

    constructor() {
        this.gatewayStore = new GatewayStore(this);
    }
}

export const appStore = new AppStore();
