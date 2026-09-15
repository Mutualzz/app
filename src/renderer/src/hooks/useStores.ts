import { AppStore } from "@stores/App.store";

let appStore: AppStore | null = null;

export function useAppStore() {
  if (!appStore) {
    appStore = new AppStore();
  }
  return appStore;
}

// This is a convenience function to get the app store without using the hook.
export const getAppStore = useAppStore;
