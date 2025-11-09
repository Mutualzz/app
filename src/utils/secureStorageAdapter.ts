import secureLocalStorage from "react-secure-storage";
import { isSSR } from ".";

export const secureStorageAdapter: Storage = {
    getItem: (key: string) =>
        (!isSSR ? secureLocalStorage.getItem(key) : null) as string | null,
    setItem: (key: string, value: string) => {
        if (isSSR) return;
        secureLocalStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (isSSR) return;
        secureLocalStorage.removeItem(key);
    },
    clear: () => {
        if (isSSR) return;
        secureLocalStorage.clear();
    },
    key: (index: number) => {
        if (isSSR) return null;
        const keys = Object.keys(secureLocalStorage);
        return keys[index] ?? null;
    },
    get length() {
        if (isSSR) return 0;
        return Object.keys(secureLocalStorage).length;
    },
};
