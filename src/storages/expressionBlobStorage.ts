import { createStore, del, get, set } from "idb-keyval";
import type { Snowflake } from "@mutualzz/types";
import { isSSR } from "@utils/index.ts";

let _blobStore: ReturnType<typeof createStore> | null = null;

const getBlobStore = () => {
    if (!_blobStore) _blobStore = createStore("expressions-blobs", "blobs");
    return _blobStore;
};

export const expressionBlobStorage = {
    save: (id: Snowflake, blob: Blob) => {
        if (isSSR) return;
        return set(id, blob, getBlobStore());
    },
    get: (id: Snowflake): Promise<Blob | undefined> => {
        if (isSSR) return Promise.resolve(undefined);
        return get(id, getBlobStore());
    },
    remove: (id: Snowflake) => {
        if (isSSR) return;
        return del(id, getBlobStore());
    },
};
