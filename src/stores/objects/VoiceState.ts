import type { Snowflake, VoiceState as MzVoiceState } from "@mutualzz/types";
import type { AppStore } from "@stores/App.store.ts";

export class VoiceState {
    userId: Snowflake;
    spaceId?: Snowflake | null;
    channelId?: Snowflake | null;
    selfMute: boolean;
    selfDeaf: boolean;
    spaceMute: boolean;
    spaceDeaf: boolean;
    sessionId: string;
    updatedAt: number;

    constructor(
        private readonly app: AppStore,
        state: MzVoiceState,
    ) {
        this.userId = state.userId;
        this.spaceId = state.spaceId ?? null;
        this.channelId = state.channelId ?? null;
        this.selfMute = state.selfMute;
        this.selfDeaf = state.selfDeaf;
        this.spaceMute = state.spaceMute;
        this.spaceDeaf = state.spaceDeaf;
        this.sessionId = state.sessionId;
        this.updatedAt = state.updatedAt;
    }

    get hasSpace() {
        return !!this.spaceId;
    }

    get user() {
        return this.app.users.get(this.userId);
    }

    get space() {
        if (!this.spaceId) return null;
        return this.app.spaces.get(this.spaceId);
    }

    get channel() {
        if (!this.channelId) return null;
        return this.channelId ? this.app.channels.get(this.channelId) : null;
    }
}
