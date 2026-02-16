import type { Snowflake } from "@mutualzz/types";
import { type APIChannel, ChannelType } from "@mutualzz/types";
import { safeLocalStorage } from "@utils/safeLocalStorage";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import { makePersistable } from "mobx-persist-store";
import type { AppStore } from "./App.store";
import { Channel } from "./objects/Channel";

export class ChannelStore {
    collapsedCategories: ObservableMap<string, Set<string>>; // Space -> Set of collapsed category IDs
    active?: Channel | null;
    activeId?: Snowflake;
    mostRecentBySpace: ObservableMap<string, Snowflake | null> =
        observable.map();
    private readonly channels: ObservableMap<string, Channel>;

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
                    },
                },
                "mostRecentBySpace",
            ],
            storage: safeLocalStorage,
        });
    }

    get preferredChannel() {
        return (
            this.getMostRecentChannelForSpace(this.app.spaces.activeId ?? "") ??
            this.getFirstNavigableChannel(this.app.spaces.activeId ?? "")
        );
    }

    get all() {
        return Array.from(this.channels.values());
    }

    get count() {
        return this.channels.size;
    }

    setPreferredActive() {
        const preferred = this.preferredChannel;
        this.setActive(preferred?.id);
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
            id ?? null,
        );
    }

    setActive(id?: Snowflake) {
        this.active = (id ? this.get(id) : null) ?? null;
        this.activeId = this.active?.id;
    }

    add(channel: APIChannel): Channel {
        const exists = this.channels.get(channel.id);
        if (exists) return exists;

        const newChannel = new Channel(this.app, channel);
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

    remove(id: string) {
        this.channels.delete(id);
    }

    has(id: string) {
        return this.channels.has(id);
    }

    sortPosition(channels: Channel[]) {
        return channels.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }

    toggleCategoryCollapse(spaceId: string, categoryId: string) {
        if (!this.collapsedCategories.has(spaceId))
            this.collapsedCategories.set(spaceId, new Set());

        const spaceCollapsed = this.collapsedCategories.get(spaceId)!;
        if (spaceCollapsed.has(categoryId)) spaceCollapsed.delete(categoryId);
        else spaceCollapsed.add(categoryId);
    }

    isCategoryCollapsed(spaceId: string, categoryId: string): boolean {
        return this.collapsedCategories.get(spaceId)?.has(categoryId) ?? false;
    }

    getSpaceVisibleChannels(spaceId: string, types?: ChannelType[]): Channel[] {
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
                .filter((id): id is string => Boolean(id)),
        );

        const visibleNonCats = viewableNonCats.filter((ch) => {
            const parentId = ch.parentId ?? null;
            return !(parentId && collapsed.has(parentId));
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
        categoryId: string | null,
        channels: Channel[],
    ): number {
        const inCategory = channels.filter((c) => c.parent?.id === categoryId);
        if (inCategory.length === 0) return -1;
        return Math.max(...inCategory.map((c) => c.position));
    }

    getFirstNavigableChannel(
        spaceId: string,
        types?: ChannelType[],
    ): Channel | undefined {
        const visibleChannels = this.getSpaceVisibleChannels(spaceId);

        return visibleChannels.find((channel) => {
            if (channel.type === ChannelType.Category) return false;
            if (types && types.length > 0) return types.includes(channel.type);
            return true;
        });
    }

    async applyReorder(
        spaceId: Snowflake,
        parentId: Snowflake | null,
        orderedIds: Snowflake[],
    ) {
        const updates = orderedIds
            .map((id, idx) => {
                const channel = this.channels.get(id);
                if (!channel) return null;

                if (parentId == null) {
                    channel.parentId = null;
                    channel.setParent(null);
                } else {
                    const parent = this.channels.get(parentId) ?? null;
                    channel.parentId = parentId;
                    channel.setParent(parent);
                }

                channel.position = idx;
                this.channels.set(channel.id, channel);

                return {
                    id: channel.id,
                    parentId,
                    position: idx,
                };
            })
            .filter(Boolean) as {
            id: Snowflake;
            parentId: Snowflake | null;
            position: number;
        }[];

        if (updates.length === 0) return;

        return this.app.rest.patch(`/channels/bulk`, {
            spaceId,
            channels: updates,
        });
    }

    async resolve(id: Snowflake, force = false) {
        if (this.has(id) && !force) return this.get(id);
        const channel = await this.app.rest.get<APIChannel>(`/channels/${id}`);
        if (!channel) return undefined;
        return this.add(channel);
    }
}
