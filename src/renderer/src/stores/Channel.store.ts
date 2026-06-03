import type { Snowflake } from "@mutualzz/types";
import { type APIChannel, ChannelType } from "@mutualzz/types";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import { makePersistable } from "mobx-persist-store";
import type { AppStore } from "./App.store";
import { Channel } from "./objects/Channel";
import { Logger } from "@mutualzz/logger";

export class ChannelStore {
    collapsedCategories: ObservableMap<string, Set<string>>; // Space -> Set of collapsed category IDs

    activeId: Snowflake | null = null;
    mostRecentBySpace: ObservableMap<string, Snowflake | null> =
        observable.map();
    private readonly channels: ObservableMap<string, Channel>;

    private readonly logger = new Logger({
        tag: "ChannelStore"
    });

    constructor(private readonly app: AppStore) {
        this.channels = observable.map();
        this.collapsedCategories = observable.map();

        makeAutoObservable(this);

        makePersistable(this, {
            name: "ChannelStore",
            properties: [
                {
                    key: "collapsedCategories",
                    serialize: (map: ObservableMap<string, Set<string>>) => {
                        const obj: Record<string, string[]> = {};
                        map.forEach((set, key) => {
                            obj[key] = Array.from(set);
                        });
                        return obj;
                    },
                    deserialize: (obj: Record<string, string[]>) => {
                        const map = observable.map<string, Set<string>>();
                        Object.entries(obj || {}).forEach(([key, arr]) => {
                            map.set(key, new Set(arr));
                        });
                        return map;
                    }
                }
            ],
            storage: localStorage
        });
    }

    get preferredChannel() {
        const spaceId = this.app.spaces.activeId ?? "@me";

        if (spaceId === "@me")
            return this.getMostRecentChannelForSpace("@me") ?? this.dms[0];

        return (
            this.getMostRecentChannelForSpace(spaceId) ??
            this.getFirstNavigableChannel(spaceId)
        );
    }

    get all() {
        return Array.from(this.channels.values());
    }

    get count() {
        return this.channels.size;
    }

    get dms() {
        const dms = this.all.filter(
            (ch) =>
                ch.type === ChannelType.DM || ch.type === ChannelType.GroupDM
        );

        return dms.slice().sort((a, b) => {
            // Filter with mentions
            const aMentions = this.app.readStates.get(a.id)?.mentionCount ?? 0;
            const bMentions = this.app.readStates.get(b.id)?.mentionCount ?? 0;
            if (aMentions > 0 !== bMentions > 0) return bMentions > 0 ? 1 : -1;

            // Filter with unread
            const aUnread = this.app.readStates.get(a.id)?.isUnread ? 1 : 0;
            const bUnread = this.app.readStates.get(b.id)?.isUnread ? 1 : 0;
            if (aUnread !== bUnread) return bUnread - aUnread; // unread first

            // Sort by recent messages
            const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
            const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
            return bTime - aTime;
        });
    }

    get active() {
        return this.activeId ? (this.get(this.activeId) ?? null) : null;
    }

    clear() {
        this.activeId = null;
        this.mostRecentBySpace.clear();
        this.channels.clear();
    }

    getDMChannel(userOne: Snowflake, userTwo: Snowflake) {
        return this.all
            .filter((ch) => ch.type === ChannelType.DM)
            .filter(
                (ch) =>
                    ch.recipientIds?.includes(userOne) &&
                    ch.recipientIds?.includes(userTwo)
            )[0];
    }

    getGroupDMChannel(users: Snowflake[]) {
        return this.all
            .filter((ch) => ch.type === ChannelType.GroupDM)
            .filter((ch) => {
                const recipientIds = ch.recipientIds ?? [];
                return (
                    users.every((u) => recipientIds.includes(u)) &&
                    recipientIds.length === users.length
                );
            })[0];
    }

    async openDM(recipientId: Snowflake): Promise<Channel> {
        const existing = this.getDMChannel(this.app.account!.id, recipientId);
        if (existing) {
            this.setActive(existing.id);
            return existing;
        }

        const data = await this.app.rest.post<APIChannel>(`/channels/@me`, {
            recipientId
        });

        const hydrated: APIChannel = {
            ...data,
            recipientIds: data.recipientIds,
            recipients: data.recipients
        };

        const channel = this.add(hydrated);
        this.setActive(channel.id);
        this.setMostRecentChannelForSpace("@me", channel.id);
        return channel;
    }

    async openGroupDM(recipientIds: Snowflake[]): Promise<Channel> {
        if (recipientIds.length > 9)
            throw new Error(
                "Group DMs cannot exceed 9 recipients (10 including you)"
            );

        // Include yourself so the length check matches the server's recipientIds
        const allIds = [this.app.account!.id, ...recipientIds];
        const existing = this.getGroupDMChannel(allIds);

        if (existing) {
            this.setActive(existing.id);
            return existing;
        }

        // Still only send the OTHER recipients to the server
        const data = await this.app.rest.post<APIChannel>(
            `/channels/@me/group`,
            { recipientIds }
        );

        const channel = this.add(data);
        this.setActive(channel.id);
        this.setMostRecentChannelForSpace("@me", channel.id);
        return channel;
    }

    closeDM(channelId: Snowflake) {
        this.remove(channelId);

        if (this.activeId === channelId) this.unsetActive();

        return this.app.rest.delete(`/channels/@me/${channelId}`);
    }

    setPreferredActive() {
        const preferred = this.preferredChannel;
        if (!preferred?.id) {
            this.logger.warn(
                "No preferred channel found, defaulting to first DM or null"
            );
            this.unsetActive();

            return;
        }

        this.setActive(preferred.id);
    }

    getMostRecentChannelForSpace(spaceId: string): Channel | undefined {
        const id = this.mostRecentBySpace.get(spaceId) ?? undefined;
        return id ? this.get(id) : undefined;
    }

    setMostRecentChannelForSpace(spaceId: string, id?: string | null) {
        if (id == null) this.mostRecentBySpace.delete(spaceId);
        else this.mostRecentBySpace.set(spaceId, id);
    }

    setMostRecentChannel(id?: string | null) {
        this.mostRecentBySpace.set(
            this.app.spaces.activeId ?? "@me",
            id ?? null
        );
    }

    setActive(id: Snowflake) {
        this.activeId = id;
    }

    unsetActive() {
        this.activeId = null;
    }

    add(channel: APIChannel): Channel {
        const exists = this.channels.get(channel.id);
        if (exists) return exists;

        const newChannel = new Channel(this.app, channel);
        if (channel.recipients) {
            channel.recipients.forEach((user) => {
                if (user.presence)
                    this.app.presence.upsert(user.id, user.presence);
            });
        }
        this.channels.set(channel.id, newChannel);
        return newChannel;
    }

    addAll(channels: APIChannel[]): Channel[] {
        return channels.map((channel) => this.add(channel));
    }

    update(channel: APIChannel) {
        this.channels.get(channel.id)?.update(channel);
    }

    get(id: Snowflake) {
        return this.channels.get(id);
    }

    remove(id: Snowflake) {
        this.channels.delete(id);
    }

    has(id: Snowflake) {
        return this.channels.has(id);
    }

    sortPosition(channels: Channel[]) {
        return channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }

    toggleCategoryCollapse(spaceId: Snowflake, categoryId: Snowflake) {
        if (!this.collapsedCategories.has(spaceId))
            this.collapsedCategories.set(spaceId, new Set());

        const spaceCollapsed = this.collapsedCategories.get(spaceId)!;
        if (spaceCollapsed.has(categoryId)) spaceCollapsed.delete(categoryId);
        else spaceCollapsed.add(categoryId);
    }

    isCategoryCollapsed(spaceId: Snowflake, categoryId: Snowflake): boolean {
        return this.collapsedCategories.get(spaceId)?.has(categoryId) ?? false;
    }

    getCollapsedCategories(spaceId: Snowflake): Set<Snowflake> {
        return this.collapsedCategories.get(spaceId) ?? new Set<Snowflake>();
    }

    getSpaceVisibleChannels(
        spaceId: Snowflake,
        types?: ChannelType[]
    ): Channel[] {
        const space = this.app.spaces.get(spaceId);
        if (!space) return [];

        const me = space.members.me;
        if (!me) return [];

        const all = space.channels;
        const collapsed =
            this.app.channels.collapsedCategories.get(spaceId) ||
            new Set<Snowflake>();

        const viewableNonCats = all.filter((ch) => {
            if (ch.type === ChannelType.Category) return false;
            if (types && types.length && !types.includes(ch.type)) return false;
            return me.canViewChannel(ch);
        });

        const categoryIdsToShow = new Set(
            viewableNonCats
                .map((c) => c.parentId)
                .filter((id): id is string => Boolean(id))
        );

        const visibleNonCats = viewableNonCats.filter((ch) => {
            const parentId = ch.parentId ?? null;
            return (
                !(parentId && collapsed.has(parentId)) ||
                ch.voiceStates.length > 0
            );
        });

        const visibleCategories = all.filter((ch) => {
            if (ch.type !== ChannelType.Category) return false;

            const hasVisibleChildren = categoryIdsToShow.has(ch.id);
            if (hasVisibleChildren) return true;

            return me.canViewChannel(ch);
        });

        return this.sortPosition([...visibleCategories, ...visibleNonCats]);
    }

    compareChannels = (a: Channel, b: Channel): number =>
        (a.position ?? -1) - (b.position ?? -1);

    getLastPositionInCategory(
        categoryId: Snowflake | null,
        channels: Channel[]
    ): number {
        const inCategory = channels.filter((c) => c.parent?.id === categoryId);
        if (inCategory.length === 0) return -1;
        return Math.max(...inCategory.map((c) => c.position));
    }

    getFirstNavigableChannel(
        spaceId: Snowflake,
        types?: ChannelType[]
    ): Channel | undefined {
        const visibleChannels = this.getSpaceVisibleChannels(spaceId);

        return visibleChannels.find((channel) => {
            if (channel.type === ChannelType.Category) return false;
            if (types && types.length > 0) return types.includes(channel.type);
            return true;
        });
    }

    setChannelOrder(spaceId: Snowflake, newOrder: Channel[]) {
        let currentCategory: Channel | null = null;

        const order = newOrder.map((channel, index) => {
            if (channel.type === ChannelType.Category) {
                currentCategory = channel;
                channel.setParent(null);
                channel.position = index;
            } else {
                channel.setParent(currentCategory);
                channel.position = index;
            }

            this.channels.set(channel.id, channel);

            return channel;
        });

        const payload = order.map((channel) => ({
            id: channel.id,
            parentId: channel.parentId ? channel.parentId : null,
            position: channel.position
        }));

        // Update the channels in the backend as well
        this.app.rest.patch(`/channels/bulk`, {
            spaceId,
            channels: payload
        });
    }

    async resolve(id: Snowflake, force = false) {
        if (this.has(id) && !force) return this.get(id);
        const channel = await this.app.rest.get<APIChannel>(`/channels/${id}`);
        if (!channel) return undefined;
        return this.add(channel);
    }
}
