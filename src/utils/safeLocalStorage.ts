import { isSSR } from ".";

export const safeLocalStorage: Storage = {
    getItem: (k) => (!isSSR ? localStorage.getItem(k) : null),
    setItem: (k, v) => {
        if (isSSR) return;
        localStorage.setItem(k, v);
    },
    removeItem: (k) => {
        if (isSSR) return;
        localStorage.removeItem(k);
    },
    clear: () => {
        if (isSSR) return;
        localStorage.clear();
    },
    key: (index: number) => {
        if (isSSR) return null;
        const keys = Object.keys(localStorage);
        return keys[index] ?? null;
    },
    get length() {
        if (isSSR) return 0;
        return Object.keys(localStorage).length;
    },
};
