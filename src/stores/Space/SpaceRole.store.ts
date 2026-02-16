import type { APIRole } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { Role } from "@stores/objects/Role";
import type { Space } from "@stores/objects/Space";
import { makeAutoObservable, observable, ObservableMap } from "mobx";

export class SpaceRoleStore {
    private readonly roles: ObservableMap<string, Role>;
    private readonly space: Space;

    constructor(
        private readonly app: AppStore,
        space: Space,
    ) {
        this.space = space;
        this.roles = observable.map();

        makeAutoObservable(this);
    }

    get all() {
        return Array.from(this.roles.values());
    }

    get sorted() {
        return this.all.sort((a, b) => a.position - b.position);
    }

    get assignable() {
        return this.sorted
            .filter((r) => r.id !== this.space.id)
            .sort((a, b) => a.position - b.position);
    }

    get size() {
        return this.roles.size;
    }

    get everyone() {
        return this.roles.get(this.space.id);
    }

    create() {
        return this.app.rest.put<APIRole>(`/spaces/${this.space.id}/roles`);
    }

    add(role: APIRole) {
        const exists = this.roles.get(role.id);
        if (exists) return exists;

        const r = new Role(this.app, role);
        this.roles.set(role.id, r);

        this.invalidateMePermCache();
        return r;
    }

    addAll(roles: APIRole[]) {
        return roles.map((role) => this.add(role));
    }

    remove(id: string) {
        const existed = this.roles.delete(id);
        if (existed) this.invalidateMePermCache();
    }

    update(role: APIRole) {
        const r = this.roles.get(role.id);
        if (!r) return;

        r.update(role);
        this.invalidateMePermCache();
    }

    get(id: string) {
        return this.roles.get(id);
    }

    has(id: string) {
        return this.roles.has(id);
    }

    private invalidateMePermCache() {
        this.space.members.me?.invalidateChannelPermCache?.();
    }
}
