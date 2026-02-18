import {
    type APIChannelPermissionOverwrite,
    type Snowflake,
} from "@mutualzz/types";
import { makeAutoObservable } from "mobx";
import {
    BitField,
    permissionFlags,
    type PermissionFlags,
} from "@mutualzz/permissions";

export class ChannelPermissionOverwrite {
    channelId: Snowflake;
    spaceId: Snowflake;

    roleId?: Snowflake | null;
    userId?: Snowflake | null;

    allow: BitField<PermissionFlags>;
    deny: BitField<PermissionFlags>;

    createdAt: Date;
    updatedAt: Date;

    constructor(overwrite: APIChannelPermissionOverwrite) {
        this.channelId = overwrite.channelId;
        this.spaceId = overwrite.spaceId;
        this.roleId = overwrite.roleId;
        this.userId = overwrite.userId;

        this.allow = BitField.fromString(
            permissionFlags,
            overwrite.allow.toString(),
        );
        this.deny = BitField.fromString(
            permissionFlags,
            overwrite.deny.toString(),
        );

        this.createdAt = new Date(overwrite.createdAt);
        this.updatedAt = new Date(overwrite.updatedAt);

        makeAutoObservable(this);
    }

    update(overwrite: APIChannelPermissionOverwrite) {
        this.channelId = overwrite.channelId;
        this.spaceId = overwrite.spaceId;

        // target
        this.roleId = overwrite.roleId;
        this.userId = overwrite.userId;

        this.allow = BitField.fromString(
            permissionFlags,
            overwrite.allow.toString(),
        );
        this.deny = BitField.fromString(
            permissionFlags,
            overwrite.deny.toString(),
        );

        this.createdAt = new Date(overwrite.createdAt);
        this.updatedAt = new Date(overwrite.updatedAt);
    }
}
