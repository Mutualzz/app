import {
    CDNRoutes,
    ImageFormat,
    type APIPrivateUser,
    type APITheme,
    type APIUserSettings,
    type DefaultAvatar,
} from "@mutualzz/types";
import type { Hex } from "@mutualzz/ui";
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
    accentColor: Hex;
    createdAt: Date;
    createdTimestamp: number;
    settings: APIUserSettings;

    raw: APIPrivateUser;

    constructor(user: APIPrivateUser) {
        this.id = user.id;
        this.username = user.username;
        this.defaultAvatar = user.defaultAvatar;
        this.avatar = user.avatar ?? null;
        this.accentColor = user.accentColor;
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
                ? this.avatar.startsWith("a_")
                    ? CDNRoutes.userAvatar(
                          this.id,
                          this.avatar,
                          ImageFormat.GIF,
                      )
                    : CDNRoutes.userAvatar(
                          this.id,
                          this.avatar,
                          ImageFormat.PNG,
                      )
                : CDNRoutes.defaultUserAvatar(this.defaultAvatar),
        );
    }

    get previousAvatarUrls(): Map<string, string> {
        const map = new Map<string, string>();
        for (const avatar of this.previousAvatars) {
            const url = REST.makeCDNUrl(
                avatar.startsWith("a_")
                    ? CDNRoutes.userAvatar(this.id, avatar, ImageFormat.GIF)
                    : CDNRoutes.userAvatar(this.id, avatar, ImageFormat.PNG),
            );
            map.set(avatar, url);
        }
        return map;
    }

    get defaultAvatarUrl() {
        return REST.makeCDNUrl(CDNRoutes.defaultUserAvatar(this.defaultAvatar));
    }
}
