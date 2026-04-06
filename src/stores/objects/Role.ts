import { type APIRole, type Snowflake } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import type { Space } from "./Space";
import {
    BitField,
    permissionFlags,
    type PermissionFlags,
    roleFlags,
    type RoleFlags,
} from "@mutualzz/permissions";
import { makeAutoObservable } from "mobx";

export class Role {
    id: Snowflake;
    name: string;
    spaceId: Snowflake;
    color: string;
    permissions: BitField<PermissionFlags>;
    position: number;
    hoist: boolean;
    flags: BitField<RoleFlags>;
    mentionable: boolean;
    createdAt: Date;
    updatedAt: Date;
    raw: APIRole;

    constructor(
        private readonly app: AppStore,
        data: APIRole,
    ) {
        this.id = data.id;
        this.name = data.name;
        this.spaceId = data.spaceId;
        if (data.space) this._space = this.app.spaces.add(data.space);

        this.color = data.color;
        this.permissions = BitField.fromString(
            permissionFlags,
            data.permissions.toString(),
        );

        this.position = data.position;
        this.hoist = data.hoist;
        this.flags = BitField.fromString(roleFlags, data.flags.toString());
        this.mentionable = data.mentionable;

        this.createdAt = new Date(data.createdAt);
        this.updatedAt = new Date(data.updatedAt);

        this.raw = data;

        makeAutoObservable(this);
    }

    _space?: Space | null;

    get space() {
        return this.app.spaces.get(this.spaceId) || this._space;
    }

    get isEveryone() {
        return this.flags.has("Everyone");
    }

    update(data: APIRole) {
        this.id = data.id;
        this.spaceId = data.spaceId;

        if (data.space) this._space = this.app.spaces.add(data.space);

        this.name = data.name;
        this.color = data.color;
        this.position = data.position;
        this.hoist = data.hoist;
        this.mentionable = data.mentionable;

        this.permissions = BitField.fromString(
            permissionFlags,
            data.permissions.toString(),
        );
        this.flags = BitField.fromString(roleFlags, data.flags.toString());

        this.createdAt = new Date(data.createdAt);
        this.updatedAt = new Date(data.updatedAt);

        this.raw = data;
    }

    delete() {
        return this.app.rest.delete(`/spaces/${this.spaceId}/roles/${this.id}`);
    }

    toJSON() {
        return this.raw;
    }
}
