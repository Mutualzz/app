import { AppStore } from "@stores/App.store";

let appStore: AppStore | null = null;

export function useAppStore() {
  if (!appStore) {
    appStore = new AppStore();
  }
  return appStore;
}
