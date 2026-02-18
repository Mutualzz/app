import { makeAutoObservable, observable } from "mobx";
import type { PresencePayload, Snowflake } from "@mutualzz/types";

export class PresenceStore {
    // userId -> presence
    private readonly presences = observable.map<Snowflake, PresencePayload>();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    upsert(userId: Snowflake, presence: PresencePayload) {
        this.presences.set(userId, presence);
    }

    get(userId: Snowflake) {
        return this.presences.get(userId) ?? null;
    }
}
