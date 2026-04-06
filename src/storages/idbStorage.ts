import { del, get, set } from "idb-keyval";
import { isSSR } from "@utils/index.ts";

export const idbStorage = {
    getItem: async (key: string) => {
        if (isSSR) return;
        const value = await get(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string) => {
        if (isSSR) return;
        await set(key, value);
    },
    removeItem: async (key: string) => {
        if (isSSR) return;
        await del(key);
    },
};
