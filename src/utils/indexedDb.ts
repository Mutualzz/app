import { openDB } from "idb";

export const getDb = () => {
    return openDB("mutualzz-cache", 3, {
        upgrade(db) {
            if (!db.objectStoreNames.contains("icons")) {
                db.createObjectStore("icons");
            }
        },
    });
};

export const getIconFromCache = async (key: string): Promise<string | null> => {
    const db = await getDb();
    const data: string | undefined = await db
        .get("icons", key)
        .catch(() => null);

    return data ?? null;
};

export const putIconInCache = async (key: string, data: string) => {
    const db = await getDb();

    const result = await db.put("icons", data, key);
    return result.toString();
};
