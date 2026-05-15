import { del, get, set } from "idb-keyval";

export const idbStorage = {
    getItem: async (key: string) => {
        const value = await get(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string) => {
        await set(key, value);
    },
    removeItem: async (key: string) => {
        await del(key);
    },
};
