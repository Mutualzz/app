import type {
    APISpaceMember,
    Snowflake,
    SpaceIconFormat,
} from "@mutualzz/types";
import {
    type APIChannel,
    type APIInvite,
    type APISpace,
    CDNRoutes,
    ImageFormat,
    type Sizes,
} from "@mutualzz/types";
import type { AppStore } from "@stores/App.store";
import { SpaceMemberListStore } from "@stores/Space/SpaceMemberList.store.ts";
import type { User } from "@stores/objects/User";
import { REST } from "@stores/REST.store";
import { SpaceMemberStore } from "@stores/Space/SpaceMember.store";
import { asAcronym } from "@utils/index";
import {
    makeAutoObservable,
    observable,
    ObservableMap,
    ObservableSet,
} from "mobx";
import type { Channel } from "./Channel";
import { Invite } from "./Invite";
import { SpaceRoleStore } from "@stores/Space/SpaceRole.store";
import { BitField, type SpaceFlags, spaceFlags } from "@mutualzz/permissions";

export class Space {
    id: Snowflake;
    name: string;
    description?: string | null = null;
    icon?: string | null = null;
    createdAt: Date;
    updatedAt: Date;

    flags: BitField<SpaceFlags>;

    invites = observable.map<string, Invite>();
    members: SpaceMemberStore;
    roles: SpaceRoleStore;
    ownerId: Snowflake;
    owner?: User | null;
    memberLists: ObservableMap<string, SpaceMemberListStore> =
        new ObservableMap();
    raw: APISpace;
    private readonly _channels: ObservableSet<string>;

    constructor(
        private readonly app: AppStore,
        space: APISpace,
    ) {
        this.app = app;

        this.id = space.id;
        this.name = space.name;
        this.description = space.description;
        this.icon = space.icon;

        this.members = new SpaceMemberStore(this.app, this);
        this.roles = new SpaceRoleStore(this.app, this);
        this.invites = observable.map();

        this.ownerId = space.ownerId;
        if (space.owner) this.owner = this.app.users.add(space.owner);

        this.createdAt = new Date(space.createdAt);
        this.updatedAt = new Date(space.updatedAt);

        this.flags = BitField.fromString(spaceFlags, space.flags.toString());

        this._channels = observable.set();

        if ("channels" in space && space.channels) {
            app.channels.addAll(space.channels);
            space.channels.forEach((channel) => this._channels.add(channel.id));
        }

        if ("members" in space && space.members)
            this.members.addAll(space.members);

        if ("roles" in space && space.roles) this.roles.addAll(space.roles);

        this.raw = space;

        makeAutoObservable(this);
    }

    get acronym() {
        return asAcronym(this.name);
    }

    get channels(): Channel[] {
        const spaceChannels = this.app.channels.all.filter((ch) =>
            this._channels.has(ch.id),
        );

        const topLevelChannels = spaceChannels.filter(
            (channel) => !channel.parent,
        );

        return topLevelChannels
            .sort(this.app.channels.compareChannels)
            .flatMap((topLevelChannel) => [
                topLevelChannel,
                ...spaceChannels
                    .filter(
                        (channel) => channel.parent?.id === topLevelChannel.id,
                    )
                    .sort(this.app.channels.compareChannels),
            ]);
    }

    get firstNavigableChannel() {
        return this.channels.find((channel) => channel.isTextChannel);
    }

    get visibleChannels() {
        return this.app.channels.getSpaceVisibleChannels(this.id);
    }

    get iconUrl() {
        if (!this.icon) return null;
        return Space.constructIconUrl(
            this.id,
            this.icon.startsWith("a_"),
            this.icon,
        );
    }

    static constructIconUrl(
        spaceId: Snowflake,
        animated = false,
        hash?: string | null,
        size: Sizes = 128,
        format: SpaceIconFormat = ImageFormat.WebP,
    ) {
        if (!hash) return null;
        return REST.makeCDNUrl(
            CDNRoutes.spaceIcon(spaceId, hash, format, size, animated),
        );
    }

    updateMemberList(data: any) {
        const store = this.memberLists.get(data.id);
        if (store) {
            store.update(data);
        } else {
            this.memberLists.set(
                data.id,
                new SpaceMemberListStore(this.app, this, data),
            );
        }
    }

    getMemberList(id: string): SpaceMemberListStore | undefined {
        return this.memberLists.get(id);
    }

    leave() {
        return this.app.rest.delete<APISpaceMember>(
            `/spaces/${this.id}/members/@me`,
        );
    }

    sortPosition(channels: Channel[]) {
        return channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }

    update(space: APISpace) {
        this.id = space.id;
        this.name = space.name;
        this.description = space.description;
        this.icon = space.icon;

        this.ownerId = space.ownerId;
        this.owner = space.owner
            ? this.app.users.add(space.owner)
            : (this.owner ?? null);

        this.createdAt = new Date(space.createdAt);
        this.updatedAt = new Date(space.updatedAt);

        this.flags = BitField.fromString(spaceFlags, space.flags.toString());

        if ("channels" in space && space.channels) {
            this.app.channels.addAll(space.channels);
            this._channels.clear();
            space.channels.forEach((ch) => this._channels.add(ch.id));
        }

        if ("members" in space && space.members)
            this.members.addAll(space.members);
        if ("roles" in space && space.roles) this.roles.addAll(space.roles);

        this.raw = space;
    }

    createInvite(channelId?: string | null) {
        return this.app.rest.post<APIInvite>(`/spaces/${this.id}/invites`, {
            channelId:
                channelId ||
                this.app.channels.activeId ||
                this.firstNavigableChannel?.id,
        });
    }

    deleteAll() {
        if (this.invites.size === 0) return;
        this.invites.clear();
        return this.app.rest.delete<{ spaceId: string }>(
            `/spaces/${this.id}/invites`,
        );
    }

    delete() {
        return this.app.rest.delete<{ id: string }>(`/spaces/${this.id}`);
    }

    addInvite(invite: APIInvite) {
        // this.app.invites.add(invite); // TODO: Add to global store? idk yet
        const newInvite = new Invite(this.app, invite);
        this.invites.set(invite.code, newInvite);
        return newInvite;
    }

    updateInvite(invite: APIInvite) {
        this.invites.get(invite.code)?.update(invite);
    }

    removeInvite(code: string) {
        this.invites.delete(code);
    }

    addChannel(channel: APIChannel) {
        const newChannel = this.app.channels.add(channel);
        this._channels.add(channel.id);
        return newChannel;
    }

    removeChannel(channelId: Snowflake) {
        this._channels.delete(channelId);
        this.app.channels.remove(channelId);
    }

    updateChannel(channel: APIChannel) {
        this.app.channels.update(channel);
    }
}
