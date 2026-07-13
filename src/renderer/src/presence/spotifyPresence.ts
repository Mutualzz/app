import type { PresenceActivity } from "@mutualzz/types";

export type SpotifyCurrentlyPlayingDto = {
  name: "Spotify";
  details: string;
  state: string;
  timestamps: { start: number; end: number };
  assets?: {
    largeImageUrl?: string;
    largeText?: string;
  };
  url?: string;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  trackUrl?: string;
  spotifyUri?: string;
};

export type SpotifyConnectionDto =
  | { connected: false; available: boolean }
  | {
      connected: true;
      displayName: string | null;
      externalUrl: string | null;
      shareSpotify: boolean;
      available: boolean;
      expired?: boolean;
    };

const CONNECTION_TTL_MS = 60_000;

let cachedConnection: SpotifyConnectionDto | null = null;
let cachedConnectionAt = 0;

export function invalidateSpotifyConnectionCache() {
  cachedConnection = null;
  cachedConnectionAt = 0;
}

export function setSpotifyConnectionCache(connection: SpotifyConnectionDto) {
  cachedConnection = connection;
  cachedConnectionAt = Date.now();
}

async function getCachedConnection(rest: {
  get: <T>(path: string) => Promise<T>;
}): Promise<SpotifyConnectionDto> {
  if (
    cachedConnection &&
    Date.now() - cachedConnectionAt < CONNECTION_TTL_MS
  ) {
    return cachedConnection;
  }

  const connection = await rest.get<SpotifyConnectionDto>("/@me/spotify");
  setSpotifyConnectionCache(connection);
  return connection;
}

export function toSpotifyPresenceActivity(
  dto: SpotifyCurrentlyPlayingDto
): PresenceActivity {
  return {
    type: "listening",
    name: "Spotify",
    applicationId: "spotify",
    details: dto.details,
    state: dto.state,
    timestamps: dto.timestamps,
    ...(dto.url || dto.trackUrl
      ? { url: dto.url ?? dto.trackUrl }
      : {}),
    ...(dto.assets ? { assets: dto.assets } : {})
  };
}

export async function loadSpotifyActivity(
  rest: {
    get: <T>(path: string) => Promise<T>;
  },
  opts?: { shareSpotify?: boolean }
): Promise<PresenceActivity | null> {
  if (opts?.shareSpotify === false) return null;

  try {
    const connection = await getCachedConnection(rest);
    if (!connection.connected) return null;
    if (connection.shareSpotify === false) return null;

    const playing = await rest.get<SpotifyCurrentlyPlayingDto | null>(
      "/@me/spotify/currently-playing"
    );
    if (!playing?.details) return null;
    return toSpotifyPresenceActivity(playing);
  } catch {
    return null;
  }
}
