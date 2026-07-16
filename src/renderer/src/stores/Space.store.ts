import type { APISpace, Snowflake } from "@mutualzz/types";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import { makePersistable } from "mobx-persist-store";
import type { AppStore } from "./App.store";
import { Space } from "./objects/Space";

export type SpaceSidebarTab = "channels" | "bridges";

export class SpaceStore {
  activeId: Snowflake | null = null;
  mostRecentSpaceId?: string | null;
  sidebarTabBySpace: Record<string, SpaceSidebarTab> = {};
  private readonly spaces: ObservableMap<string, Space>;

  constructor(private readonly app: AppStore) {
    this.spaces = observable.map();
    makeAutoObservable(this, {}, { autoBind: true });

    makePersistable(this, {
      name: "SpaceStore",
      properties: ["mostRecentSpaceId", "sidebarTabBySpace"],
      storage: localStorage
    });
  }

  getSidebarTab(spaceId: string): SpaceSidebarTab {
    return this.sidebarTabBySpace[spaceId] ?? "channels";
  }

  setSidebarTab(spaceId: string, tab: SpaceSidebarTab) {
    this.sidebarTabBySpace = { ...this.sidebarTabBySpace, [spaceId]: tab };
  }

  get mostRecentSpace(): Space | undefined {
    return this.spaces.get(this.mostRecentSpaceId ?? "");
  }

  get all() {
    return Array.from(this.spaces.values());
  }

  get positioned() {
    const positions = this.app.settings?.spacePositions;

    if (!positions || positions.size === 0) return this.all;

    const positionedSpaces = positions
      .toArray()
      .map((id) => this.spaces.get(id))
      .filter((space): space is Space => space !== undefined);

    const unpositionedSpaces = this.all.filter(
      (space) => !positions.has(space.id)
    );

    return [...positionedSpaces, ...unpositionedSpaces];
  }

  get count() {
    return this.spaces.size;
  }

  get ownerOf() {
    return Array.from(
      this.spaces
        .values()
        .filter((space) => space.ownerId === this.app.account?.id)
    );
  }

  get active() {
    return this.activeId ? this.spaces.get(this.activeId) : null;
  }

  setActive(id: Snowflake) {
    this.activeId = id;
  }

  unsetActive() {
    this.activeId = null;
  }

  setPreferredActive() {
    const preferred = this.mostRecentSpace ?? this.all[0];
    if (!preferred) {
      this.unsetActive();
      return undefined;
    }

    if (this.activeId !== preferred.id) this.setActive(preferred.id);

    return preferred;
  }

  clear() {
    this.activeId = null;
    this.mostRecentSpaceId = null;
    this.spaces.clear();
  }

  setMostRecentSpace(id?: Snowflake | null) {
    this.mostRecentSpaceId = id;
  }

  add(space: APISpace): Space {
    const exists = this.spaces.get(space.id);
    if (exists) return exists;

    const newSpace = new Space(this.app, space);
    this.spaces.set(space.id, newSpace);
    return newSpace;
  }

  addAll(spaces: APISpace[]): Space[] {
    return spaces.map((space) => this.add(space));
  }

  update(space: APISpace) {
    this.spaces.get(space.id)?.update(space);
  }

  get(id: Snowflake) {
    return this.spaces.get(id);
  }

  remove(id: Snowflake) {
    this.spaces.delete(id);
  }

  has(id: Snowflake) {
    return this.spaces.has(id);
  }

  async resolve(id: Snowflake, force = false) {
    if (this.has(id) && !force) return this.get(id);
    const space = await this.app.rest.get<APISpace>(`/spaces/${id}`);
    if (!space) return undefined;
    return this.add(space);
  }
}
