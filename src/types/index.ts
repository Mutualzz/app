import type { Snowflake, VoiceState } from "@mutualzz/types";

export const WINDOW_TITLEBAR_ZINDEX = 99999999;

export interface VoiceServerUpdatePayload {
    roomId: string;
    voiceEndpoint: string;
    voiceToken: string;
}

export interface VoiceStateSyncPayload {
    channelId: Snowflake;
    states: VoiceState[];
}
