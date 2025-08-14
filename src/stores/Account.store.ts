import type { APITheme, APIUser, APIUserSettings } from "@mutualzz/types";
import { makeAutoObservable } from "mobx";

export class AccountStore {
    id: string;
    username: string;
    globalName?: string | null = null;
    email?: string | null = null;
    themes?: APITheme[] | null = null;
    createdAt: Date;
    createdTimestamp: number;
    settings: APIUserSettings;

    raw: APIUser;

    constructor(user: APIUser) {
        this.id = user.id;
        this.username = user.username;
        this.globalName = user.globalName ?? null;
        this.email = user.email ?? null;
        this.themes = user.themes ?? null;
        this.settings = user.settings;
        this.createdAt = user.createdAt;
        this.createdTimestamp = user.createdTimestamp;

        this.raw = user;

        makeAutoObservable(this);
    }
}
