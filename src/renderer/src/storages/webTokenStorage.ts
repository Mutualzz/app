import type { TokenStorage } from "@app-types/index";

export const webTokenStorage: TokenStorage = {
  async get() {
    return localStorage.getItem("token");
  },
  async set(token) {
    localStorage.setItem("token", token);
  },
  async delete() {
    localStorage.removeItem("token");
  }
};
