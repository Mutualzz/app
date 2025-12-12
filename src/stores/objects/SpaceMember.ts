import type { APISpaceMember, Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { makeAutoObservable } from "mobx";
import type { Space } from "./Space";
import { User } from "./User";

export class SpaceMember {
    readonly space: Space;

    user?: User;
    userId?: Snowflake | null;
    nickname?: string | null;
    avatar?: string | null;
    joinedAt: Date;

    constructor(
        private readonly app: AppStore,
        space: Space,
        member: APISpaceMember,
    ) {
        this.space = space;

        this.userId = member.userId;

        if (member.user) {
            this.user = this.app.users.add(member.user);
        }

        this.nickname = member.nickname;
        this.avatar = member.avatar;
        this.joinedAt = new Date(member.joinedAt);

        makeAutoObservable(this);
    }

    update(member: APISpaceMember) {
        Object.assign(this, member);
    }

    get displayName() {
        return this.nickname ?? this.user?.displayName ?? "Unknown User";
    }
}
