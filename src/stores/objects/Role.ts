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

export class Role {
    id: Snowflake;
    name: string;
    spaceId: Snowflake;
    space?: Space | null;

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
        role: APIRole,
    ) {
        this.id = role.id;
        this.name = role.name;
        this.spaceId = role.spaceId;
        if (role.space) this.space = this.app.spaces.add(role.space);

        this.color = role.color;
        this.permissions = BitField.fromString(
            permissionFlags,
            role.permissions.toString(),
        );

        this.position = role.position;
        this.hoist = role.hoist;
        this.flags = BitField.fromString(roleFlags, role.flags.toString());
        this.mentionable = role.mentionable;

        this.createdAt = new Date(role.createdAt);
        this.updatedAt = new Date(role.updatedAt);

        this.raw = role;
    }

    update(role: APIRole) {
        this.raw = role;

        this.id = role.id;
        this.name = role.name;
        this.spaceId = role.spaceId;
        if (role.space) this.space = this.app.spaces.add(role.space);

        this.color = role.color;
        this.position = role.position;
        this.hoist = role.hoist;
        this.mentionable = role.mentionable;

        this.permissions = BitField.fromString(
            permissionFlags,
            role.permissions.toString(),
        );
        this.flags = BitField.fromString(roleFlags, role.flags.toString());

        this.createdAt = new Date(role.createdAt);
        this.updatedAt = new Date(role.updatedAt);
    }

    get isEveryone() {
        return this.flags.has("Everyone");
    }

    delete() {
        return this.app.rest.delete(`/spaces/${this.spaceId}/roles/${this.id}`);
    }

    toJSON() {
        return this.raw;
    }
}
