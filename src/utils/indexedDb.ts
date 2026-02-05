import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "mutualzz-cache";
const DB_VERSION = 5;
const ICON_STORE = "icons";

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDb = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, _oldVersion, _newVersion, transaction) {
                if (!db.objectStoreNames.contains(ICON_STORE)) {
                    db.createObjectStore(ICON_STORE);
                    return;
                }

                transaction.objectStore(ICON_STORE).clear();
            },
        });
    }
    return dbPromise;
};

export const getIconFromCache = async (key: string): Promise<Blob | null> => {
    const db = await getDb();
    const blob = (await db
        .get(ICON_STORE, key)
        .catch(() => null)) as Blob | null;

    return blob ?? null;
};

export const putIconInCache = async (key: string, blob: Blob) => {
    const db = await getDb();
    await db.put(ICON_STORE, blob, key);
};

export const clearIconCache = async () => {
    const db = await getDb();
    await db.clear(ICON_STORE);
};
