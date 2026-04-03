import type { AppStore } from "@stores/App.store.ts";
import { makeAutoObservable, observable, type ObservableMap } from "mobx";
import type { Snowflake, VoiceState as JSONVoiceState } from "@mutualzz/types";
import { VoiceState } from "@stores/objects/VoiceState.ts";

export class VoiceStatesStore {
    private readonly states: ObservableMap<Snowflake, VoiceState>;

    constructor(private readonly app: AppStore) {
        this.states = observable.map();

        makeAutoObservable(this, {}, { autoBind: true });
    }

    get all() {
        return Array.from(this.states.values());
    }

    upsert(state: JSONVoiceState) {
        const existing = this.states.get(state.userId);

        if (existing) {
            existing.spaceId = state.spaceId ?? null;
            existing.channelId = state.channelId ?? null;
            existing.selfMute = state.selfMute;
            existing.selfDeaf = state.selfDeaf;
            existing.spaceMute = state.spaceMute;
            existing.spaceDeaf = state.spaceDeaf;
            existing.sessionId = state.sessionId;
            existing.updatedAt = state.updatedAt;
            return existing;
        }

        const newVoiceState = new VoiceState(this.app, state);
        this.states.set(state.userId, newVoiceState);
        return newVoiceState;
    }

    set(states: JSONVoiceState[]) {
        const nextIds = new Set<Snowflake>();

        for (const state of states) {
            nextIds.add(state.userId);
            this.upsert(state);
        }

        for (const existingId of this.states.keys()) {
            if (!nextIds.has(existingId)) {
                this.states.delete(existingId);
            }
        }
    }

    remove(userId: Snowflake) {
        this.states.delete(userId);
    }

    clear() {
        this.states.clear();
    }

    get(userId: Snowflake) {
        return this.states.get(userId);
    }

    getAllBySpace(spaceId?: Snowflake | null) {
        return this.all.filter((state) => state.spaceId === (spaceId ?? null));
    }

    getAllByChannel(channelId?: Snowflake | null) {
        return this.all.filter(
            (state) => state.channelId === (channelId ?? null),
        );
    }

    getBySpace(userId: Snowflake, spaceId: Snowflake) {
        return this.all.find(
            (state) => state.spaceId === spaceId && state.userId === userId,
        );
    }

    getByChannel(userId: Snowflake, channelId: Snowflake) {
        return this.all.find(
            (state) => state.channelId === channelId && state.userId === userId,
        );
    }
}
