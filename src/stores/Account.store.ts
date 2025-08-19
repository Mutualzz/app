import {
    CDNRoutes,
    ImageFormat,
    type APITheme,
    type APIUser,
    type APIUserSettings,
    type DefaultAvatar,
} from "@mutualzz/types";
import REST from "@utils/REST";
import { makeAutoObservable } from "mobx";

export class AccountStore {
    id: string;
    username: string;
    defaultAvatar: DefaultAvatar;
    previousAvatars: string[] = [];
    avatar?: string | null = null;
    globalName?: string | null = null;
    email?: string | null = null;
    themes: APITheme[] | null = [];
    createdAt: Date;
    createdTimestamp: number;
    settings: APIUserSettings;

    raw: APIUser;

    constructor(user: APIUser) {
        this.id = user.id;
        this.username = user.username;
        this.defaultAvatar = user.defaultAvatar;
        this.avatar = user.avatar ?? null;
        this.previousAvatars = user.previousAvatars ?? [];
        this.globalName = user.globalName ?? null;
        this.email = user.email ?? null;
        this.themes = user.themes ?? [];
        this.settings = user.settings;
        this.createdAt = user.createdAt;
        this.createdTimestamp = user.createdTimestamp;

        this.raw = user;

        makeAutoObservable(this);
    }

    get avatarUrl() {
        return REST.makeCDNUrl(
            this.avatar
                ? CDNRoutes.userAvatar(this.id, this.avatar, ImageFormat.PNG)
                : CDNRoutes.defaultUserAvatar(this.defaultAvatar),
        );
    }
}
