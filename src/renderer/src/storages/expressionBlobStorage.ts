import { createStore, del, get, set } from "idb-keyval";
import type { Snowflake } from "@mutualzz/types";

let _blobStore: ReturnType<typeof createStore> | null = null;

const getBlobStore = () => {
    if (!_blobStore) _blobStore = createStore("expressions-blobs", "blobs");
    return _blobStore;
};

export const expressionBlobStorage = {
    save: (id: Snowflake, blob: Blob) => {
        return set(id, blob, getBlobStore());
    },
    get: (id: Snowflake): Promise<Blob | undefined> => {
        return get(id, getBlobStore());
    },
    remove: (id: Snowflake) => {
        return del(id, getBlobStore());
    },
};
