import type { APISpaceMember } from "@mutualzz/types";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { AppStore } from "../App.store";
import type { Space } from "../objects/Space";
import { SpaceMember } from "../objects/SpaceMember";

export class SpaceMemberStore {
    private readonly members: ObservableMap<string, SpaceMember>; // userId(string) -> SpaceMember
    private readonly space: Space;

    constructor(
        private readonly app: AppStore,
        space: Space,
    ) {
        this.space = space;
        this.members = observable.map();

        makeAutoObservable(this);
    }

    get all() {
        return Array.from(this.members.values());
    }

    get size() {
        return this.members.size;
    }

    get me() {
        const meId = this.app.account?.id;
        if (!meId) return null;
        return this.get(meId);
    }

    add(member: APISpaceMember) {
        const exists = this.members.get(member.userId);
        if (exists) {
            exists.update?.(member);
            return exists;
        }

        const m = new SpaceMember(this.app, this.space, member);
        this.members.set(member.userId, m);
        return m;
    }

    addAll(members: APISpaceMember[]) {
        for (const member of members) this.add(member);
    }

    remove(id: string) {
        this.members.delete(id);
    }

    update(member: APISpaceMember) {
        const existingMember = this.members.get(member.userId);
        if (!existingMember) return;

        if (Array.isArray(member.roles)) {
            existingMember.roles.clear();

            // Always include @everyone
            existingMember.roles.add(this.space.id);

            for (const memberRole of member.roles) {
                if (!memberRole?.roleId) continue;
                existingMember.roles.add(memberRole.roleId);
            }
        }

        existingMember.update(member);

        const meId = this.app.account?.id;
        if (meId != null && meId === member.userId) {
            existingMember.invalidateChannelPermCache?.();
        }
    }

    get(id: string) {
        return this.members.get(id);
    }

    has(id: string) {
        return this.members.has(id);
    }
}
