import { openDB } from "idb";

export const getDb = () => {
    return openDB("mutualzz-cache", 1, {
        upgrade(db) {
            db.createObjectStore("icons");
        },
    });
};

export const getIconFromCache = async (key: string): Promise<string | null> => {
    const db = await getDb();
    const data: string | undefined = await db.get("icons", key);
    return data ?? null;
};

export const putIconInCache = async (key: string, data: string) => {
    const db = await getDb();
    await db.put("icons", data, key);
};
