import { type APISpaceMember, type Snowflake, type VoiceState, } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { makeAutoObservable, observable, ObservableMap } from "mobx";
import type { Space } from "./Space";
import { User } from "./User";
import type { Role } from "./Role";
import type { Channel } from "./Channel";
import {
    ALL_BITS,
    BitField,
    memberFlags,
    type MemberFlags,
    type PermissionFlag,
    permissionFlags,
    type PermissionFlags,
    resolveBaseBits,
    resolveEffectiveChannelBits,
} from "@mutualzz/permissions";

export class SpaceMember {
    id: Snowflake;

    spaceId: Snowflake;
    space?: Space | null;

    userId: Snowflake;
    user?: User | null;

    flags: BitField<MemberFlags>;
    nickname?: string | null;
    avatar?: string | null;
    banner?: string | null;

    roles = observable.set<string>();

    joinedAt: Date;
    updatedAt: Date;
    voiceState?: VoiceState | null;
    private channelPermCache: ObservableMap<string, bigint> = observable.map();

    constructor(
        private readonly app: AppStore,
        space: Space,
        member: APISpaceMember,
    ) {
        makeAutoObservable(this);

        this.id = member.userId;

        this.spaceId = space.id;
        this.space = space;

        this.userId = member.userId;
        if (member.user) this.user = this.app.users.add(member.user);

        this.roles.add(space.id); // @everyone

        this.flags = BitField.fromString(memberFlags, member.flags.toString());

        this.nickname = member.nickname;
        this.avatar = member.avatar;
        this.banner = member.banner;

        if (member.roles) {
            for (const mr of member.roles) this.roles.add(mr.roleId);
        }

        this.joinedAt = new Date(member.joinedAt);
        this.updatedAt = new Date(member.updatedAt);
    }

    get displayName() {
        return this.nickname ?? this.user?.displayName ?? "Unknown User";
    }

    get highestRole() {
        const space = this.space;
        if (!space) return null;

        let highest: Role | null = null;
        const everyoneId = space.id;

        for (const rid of this.roles) {
            if (rid === everyoneId) continue;

            const role = space.roles.get(rid);
            if (!role) continue;

            if (!highest) {
                highest = role;
                continue;
            }

            if (role.position > highest.position) highest = role;
            else if (
                role.position === highest.position &&
                BigInt(role.id) > BigInt(highest.id)
            )
                highest = role;
        }

        return highest;
    }

    get memberRoleIds(): string[] {
        return Array.from(this.roles);
    }

    get baseBits(): bigint {
        const space = this.space;
        if (!space) return 0n;

        if (space.ownerId === this.userId) return ALL_BITS;

        if (space.roles.all.length === 0) return 0n;

        const roles = space.roles.all.map((r) => ({
            id: r.id,
            permissions: r.permissions.bits,
        }));

        return resolveBaseBits(space.id, roles, this.memberRoleIds);
    }

    get basePermissions(): BitField<PermissionFlags> {
        const bits = this.baseBits;

        if (
            (bits & permissionFlags.Administrator) ===
            permissionFlags.Administrator
        )
            return BitField.fromBits(permissionFlags, ALL_BITS);

        return BitField.fromBits(permissionFlags, bits);
    }

    get resolvedRoles(): Role[] {
        const space = this.space;
        if (!space) return [];
        return Array.from(this.roles)
            .map((id) => space.roles.get(id))
            .filter(Boolean) as Role[];
    }

    setVoiceState(voiceState: VoiceState | null) {
        this.voiceState = voiceState;
    }

    getVoiceState() {
        return this.voiceState;
    }

    update(member: APISpaceMember) {
        const uid = member.userId ?? member.user?.id ?? this.userId;

        this.userId = uid;
        this.id = uid;

        this.spaceId = member.spaceId ?? this.spaceId;

        if (member.user) {
            const userId = member.user.id ?? uid;
            const existing = this.app.users.get?.(userId);

            if (existing) this.app.users.update?.(member.user);
            else this.app.users.add?.(member.user);

            this.user = this.app.users.get?.(userId) ?? new User(member.user);
        } else if (this.userId) {
            this.user = this.app.users.get?.(this.userId) ?? this.user ?? null;
        }

        this.nickname = member.nickname ?? null;
        this.avatar = member.avatar ?? null;
        this.banner = member.banner ?? null;

        this.flags = BitField.fromString(memberFlags, member.flags.toString());

        if (member.joinedAt) this.joinedAt = new Date(member.joinedAt);
        if (member.updatedAt) this.updatedAt = new Date(member.updatedAt);

        if (this.space) {
            this.roles.clear();
            this.roles.add(this.space.id);
            if (member.roles)
                for (const mr of member.roles) this.roles.add(mr.roleId);
        }

        this.invalidateChannelPermCache();
    }

    invalidateChannelPermCache() {
        this.channelPermCache.clear();
    }

    hasPermission(flag: PermissionFlag, channel?: Channel) {
        if (!channel) return this.basePermissions.has(flag);

        const permissions = this.resolveChannelPermissions(channel);

        if (!permissions.has("ViewChannel")) return false;

        return permissions.has(flag);
    }

    hasAllPermissions(flags: PermissionFlag[], channel?: Channel) {
        if (channel) {
            const channelPerms = this.resolveChannelPermissions(channel);
            return flags.every((flag) => channelPerms.has(flag));
        }
        return flags.every((flag) => this.basePermissions.has(flag));
    }

    hasAnyPermission(flags: PermissionFlag[], channel?: Channel) {
        if (channel) {
            const channelPerms = this.resolveChannelPermissions(channel);
            return flags.some((flag) => channelPerms.has(flag));
        }
        return flags.some((flag) => this.basePermissions.has(flag));
    }

    resolveChannelPermissions(channel: Channel): BitField<PermissionFlags> {
        const space = this.space;
        if (!space) return BitField.fromString(permissionFlags, "0");

        if (space.roles.all.length === 0)
            return BitField.fromBits(permissionFlags, 0n);

        const cached = this.channelPermCache.get(channel.id);
        if (cached != null) return BitField.fromBits(permissionFlags, cached);

        const baseBits = this.baseBits;

        // Admin shortcut
        if (
            (baseBits & permissionFlags.Administrator) ===
            permissionFlags.Administrator
        ) {
            const bits = ALL_BITS;
            this.channelPermCache.set(channel.id, bits);
            return BitField.fromBits(permissionFlags, bits);
        }

        const parent = channel.parent;

        const parentOverwrites = parent
            ? parent.overwrites.map((o) => ({
                  roleId: o.roleId ?? null,
                  userId: o.userId ?? null,
                  allow: o.allow.bits,
                  deny: o.deny.bits,
              }))
            : null;

        const channelOverwrites = channel.overwrites.map((o) => ({
            roleId: o.roleId ?? null,
            userId: o.userId ?? null,
            allow: o.allow.bits,
            deny: o.deny.bits,
        }));

        const effectiveBits = resolveEffectiveChannelBits({
            baseBits,
            userId: this.userId,
            everyoneRoleId: space.id,
            memberRoleIds: this.memberRoleIds,
            parentOverwrites,
            channelOverwrites,
        });

        this.channelPermCache.set(channel.id, effectiveBits);
        return BitField.fromBits(permissionFlags, effectiveBits);
    }

    canViewChannel(channel: Channel) {
        return this.resolveChannelPermissions(channel).has("ViewChannel");
    }

    canSendMessages(channel: Channel) {
        const permissions = this.resolveChannelPermissions(channel);
        return (
            permissions.has("ViewChannel") && permissions.has("SendMessages")
        );
    }

    canConnectToVoice(channel: Channel) {
        const permissions = this.resolveChannelPermissions(channel);
        return this.canViewChannel(channel) && permissions.has("Connect");
    }

    compareRoleHierarchy(other: SpaceMember): number {
        // returns: 1 if this > other, 0 tie, -1 if this < other
        const a = this.highestRole;
        const b = other.highestRole;

        if (!a && !b) return 0;
        if (a && !b) return 1;
        if (!a && b) return -1;

        // both exist
        if (a!.position !== b!.position)
            return a!.position > b!.position ? 1 : -1;

        const aid = BigInt(a!.id);
        const bid = BigInt(b!.id);
        if (aid === bid) return 0;
        return aid > bid ? 1 : -1;
    }

    canManageMember(target: SpaceMember): boolean {
        const space = this.space;
        if (!space) return false;

        // must have ManageRoles
        if (!this.hasPermission("ManageRoles")) return false;

        const actorIsOwner = space.ownerId === this.userId;
        if (actorIsOwner) return true;

        const targetIsOwner = space.ownerId === target.userId;
        if (targetIsOwner) return false;

        return this.compareRoleHierarchy(target) === 1;
    }

    async addRole(role: Role) {
        const rid = role.id;
        this.roles.add(rid);
        this.invalidateChannelPermCache();

        try {
            return this.app.rest.put(
                `/spaces/${this.spaceId}/members/${this.userId}/roles/${role.id}`,
            );
        } catch (e) {
            this.roles.delete(rid);
            this.invalidateChannelPermCache();
            throw e;
        }
    }

    async removeRole(role: Role) {
        const rid = role.id;
        this.roles.delete(rid);
        this.invalidateChannelPermCache();

        try {
            return this.app.rest.delete(
                `/spaces/${this.spaceId}/members/${this.userId}/roles/${role.id}`,
            );
        } catch (e) {
            this.roles.add(rid);
            this.invalidateChannelPermCache();
            throw e;
        }
    }
}
