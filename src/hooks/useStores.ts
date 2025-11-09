import { AppStore } from "@stores/App.store";

const appStore = new AppStore();

export function useAppStore() {
    return appStore;
}
