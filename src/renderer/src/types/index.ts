import type { Snowflake, VoiceState } from "@mutualzz/types";

export const WINDOW_TITLEBAR_ZINDEX = 9999999999999;

export interface VoiceServerUpdatePayload {
  roomId: string;
  spaceId: string | null;
  channelId: string;
  voiceEndpoint: string;
  voiceToken: string;
  sessionId: string;
}

export interface VoiceStateSyncPayload {
  channelId: Snowflake;
  states: VoiceState[];
}

export interface VoiceTarget {
  spaceId?: Snowflake | null;
  channelId: Snowflake;
}

export interface TokenStorage {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  delete(): Promise<void>;
}
