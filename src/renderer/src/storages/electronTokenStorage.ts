import type { TokenStorage } from "@renderer/types";

export const electronTokenStorage: TokenStorage = {
    async get() {
        if (!window.api) return null;
        return await window.api.storage.getToken();
    },

    async set(token: string) {
        if (!window.api) throw new Error("API not available");
        await window.api.storage.setToken(token);
    },

    async delete() {
        if (!window.api) throw new Error("API not available");
        await window.api.storage.deleteToken();
    }
};
