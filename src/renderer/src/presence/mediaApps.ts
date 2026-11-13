export interface MediaApp {
  name: string;
  applicationId: string;
}

export const MEDIA_APPS: MediaApp[] = [
  { name: "Spotify", applicationId: "spotify" },
  { name: "Apple Music", applicationId: "apple-music" },
  { name: "TIDAL", applicationId: "tidal" },
  { name: "Deezer", applicationId: "deezer" },
  { name: "Amazon Music", applicationId: "amazon-music" },
  { name: "YouTube Music", applicationId: "youtube-music" },
  { name: "foobar2000", applicationId: "foobar2000" },
  { name: "MusicBee", applicationId: "musicbee" },
  { name: "AIMP", applicationId: "aimp" }
];

const loggedUnknownMediaSources = new Set<string>();

function normalizeMediaName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function findMediaApp(sourceAppId: string) {
  const normalizedSource = normalizeMediaName(sourceAppId);
  const mediaApp = MEDIA_APPS.find((candidate) =>
    normalizedSource.includes(normalizeMediaName(candidate.name))
  );

  if (!mediaApp && !loggedUnknownMediaSources.has(sourceAppId)) {
    loggedUnknownMediaSources.add(sourceAppId);
    console.debug("[Media] ignoring unknown source", sourceAppId);
  }

  return mediaApp ?? null;
}
