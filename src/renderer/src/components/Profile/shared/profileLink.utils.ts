export type ProfileLinkKind =
  | "youtube"
  | "twitch"
  | "spotify"
  | "soundcloud"
  | "apple"
  | "deezer"
  | "bandcamp"
  | "github"
  | "discord"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "reddit"
  | "website";

export type ProfileEmbedProvider =
  | "youtube"
  | "twitch"
  | "soundcloud"
  | "spotify"
  | "apple"
  | "deezer"
  | "bandcamp";

export type ProfileUrlResourceType =
  | "video"
  | "channel"
  | "playlist"
  | "track"
  | "album"
  | "artist"
  | "song"
  | "clip"
  | "profile"
  | "post"
  | "repository"
  | "invite"
  | "page";

export interface ResolvedProfileUrl {
  kind: ProfileLinkKind;
  resourceType: ProfileUrlResourceType;
  label: string;
  detail?: string;
  color: string;
  hostname: string;
  embedUrl?: string | null;
  embedProvider?: ProfileEmbedProvider | null;
}

const GENERIC_LABELS = new Set([
  "",
  "my link",
  "new link",
  "link",
  "website",
  "youtube",
  "twitch",
  "spotify",
  "soundcloud",
  "apple music",
  "deezer",
  "bandcamp",
  "github",
  "discord",
  "x / twitter",
  "instagram",
  "tiktok",
  "linkedin",
  "reddit"
]);

const PLATFORM_COLORS: Record<ProfileLinkKind, string> = {
  youtube: "#FF0000",
  twitch: "#9146FF",
  spotify: "#1DB954",
  soundcloud: "#FF5500",
  apple: "#FA243C",
  deezer: "#A238FF",
  bandcamp: "#629AA9",
  github: "#24292F",
  discord: "#5865F2",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  tiktok: "#EE1D52",
  linkedin: "#0A66C2",
  reddit: "#FF4500",
  website: "#6366F1"
};

const getTwitchParent = () => {
  if (typeof window === "undefined") return "localhost";
  return window.location.hostname || "localhost";
};

const slugToTitle = (value: string) =>
  decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const build = (
  kind: ProfileLinkKind,
  resourceType: ProfileUrlResourceType,
  label: string,
  hostname: string,
  detail?: string,
  embed?: { provider: ProfileEmbedProvider; url: string }
): ResolvedProfileUrl => ({
  kind,
  resourceType,
  label,
  detail,
  color: PLATFORM_COLORS[kind],
  hostname,
  embedProvider: embed?.provider ?? null,
  embedUrl: embed?.url ?? null
});

const parseYoutube = (
  parsed: URL,
  host: string,
  path: string,
  _href: string
): ResolvedProfileUrl | null => {
  if (!host.includes("youtube.com") && host !== "youtu.be") return null;

  const videoFromPath = path.match(
    /\/(?:watch\/|embed\/|shorts\/|live\/|v\/)([a-zA-Z0-9_-]{11})/
  );
  const videoFromQuery = parsed.searchParams.get("v");
  const videoFromShort = host === "youtu.be" ? path.slice(1).split(/[/?#]/)[0] : null;
  const videoId =
    (videoFromQuery && /^[a-zA-Z0-9_-]{11}$/.test(videoFromQuery)
      ? videoFromQuery
      : null) ??
    videoFromPath?.[1] ??
    (videoFromShort && /^[a-zA-Z0-9_-]{11}$/.test(videoFromShort)
      ? videoFromShort
      : null);

  if (videoId) {
    return build(
      "youtube",
      "video",
      "YouTube Video",
      host,
      videoId,
      {
        provider: "youtube",
        url: `https://www.youtube.com/embed/${videoId}`
      }
    );
  }

  const playlistId = parsed.searchParams.get("list");
  if (playlistId && (path.includes("/playlist") || videoFromQuery)) {
    return build("youtube", "playlist", "YouTube Playlist", host, playlistId);
  }

  const channelHandle = path.match(/^\/@([a-zA-Z0-9._-]+)/)?.[1];
  if (channelHandle) {
    return build(
      "youtube",
      "channel",
      "YouTube Channel",
      host,
      `@${channelHandle}`
    );
  }

  const channelId = path.match(/^\/channel\/([a-zA-Z0-9_-]+)/)?.[1];
  if (channelId) {
    return build("youtube", "channel", "YouTube Channel", host, channelId);
  }

  const customChannel = path.match(/^\/c\/([a-zA-Z0-9._-]+)/)?.[1];
  if (customChannel) {
    return build(
      "youtube",
      "channel",
      "YouTube Channel",
      host,
      customChannel
    );
  }

  const userChannel = path.match(/^\/user\/([a-zA-Z0-9._-]+)/)?.[1];
  if (userChannel) {
    return build("youtube", "channel", "YouTube Channel", host, userChannel);
  }

  if (path === "/feed/subscriptions" || path === "/feed/trending") {
    return build("youtube", "page", "YouTube", host);
  }

  if (host.includes("youtube.com") || host === "youtu.be") {
    return build("youtube", "page", "YouTube", host, path !== "/" ? path : undefined);
  }

  return null;
};

const parseTwitch = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("twitch.tv")) return null;
  const parent = getTwitchParent();

  const videoId = path.match(/^\/videos\/(\d+)/)?.[1];
  if (videoId) {
    return build("twitch", "video", "Twitch Video", host, videoId, {
      provider: "twitch",
      url: `https://player.twitch.tv/?video=${videoId}&parent=${parent}`
    });
  }

  const clipId =
    path.match(/^\/clip\/([\w-]+)/)?.[1] ??
    (host === "clips.twitch.tv" ? path.slice(1).split(/[/?#]/)[0] : null);
  if (clipId) {
    return build("twitch", "clip", "Twitch Clip", host, clipId, {
      provider: "twitch",
      url: `https://clips.twitch.tv/embed?clip=${clipId}&parent=${parent}`
    });
  }

  const channel = path.match(/^\/([a-zA-Z0-9_]+)$/)?.[1];
  if (channel && !["directory", "downloads", "jobs"].includes(channel)) {
    return build("twitch", "channel", "Twitch Channel", host, channel, {
      provider: "twitch",
      url: `https://player.twitch.tv/?channel=${channel}&parent=${parent}`
    });
  }

  return build("twitch", "page", "Twitch", host);
};

const parseSpotify = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("spotify.com")) return null;
  const match = path.match(/^\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/);
  if (!match) return build("spotify", "page", "Spotify", host);

  const [, type, id] = match;
  const label =
    type === "track" || type === "episode"
      ? "Spotify Track"
      : type === "album" || type === "show"
        ? "Spotify Album"
        : type === "playlist"
          ? "Spotify Playlist"
          : "Spotify Artist";

  return build(
    "spotify",
    type === "artist"
      ? "artist"
      : type === "playlist"
        ? "playlist"
        : type === "album" || type === "show"
          ? "album"
          : "track",
    label,
    host,
    id,
    {
      provider: "spotify",
      url: `https://open.spotify.com/embed/${type}/${id}`
    }
  );
};

const parseSoundcloud = (host: string, path: string, href: string): ResolvedProfileUrl | null => {
  if (!host.includes("soundcloud.com")) return null;

  if (path.match(/^\/[\w-]+\/sets\//)) {
    const detail = path.split("/").filter(Boolean).slice(-1)[0];
    return build("soundcloud", "playlist", "SoundCloud Playlist", host, slugToTitle(detail), {
      provider: "soundcloud",
      url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
    });
  }

  if (path.match(/^\/[\w-]+\/[\w-]+/)) {
    const parts = path.split("/").filter(Boolean);
    return build(
      "soundcloud",
      "track",
      "SoundCloud Track",
      host,
      slugToTitle(parts[parts.length - 1]),
      {
        provider: "soundcloud",
        url: `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
      }
    );
  }

  const profile = path.match(/^\/([\w-]+)$/)?.[1];
  if (profile && !["discover", "stream", "you", "pages"].includes(profile)) {
    return build("soundcloud", "artist", "SoundCloud Artist", host, slugToTitle(profile));
  }

  return build("soundcloud", "page", "SoundCloud", host);
};

const parseApple = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("music.apple.com") && !host.includes("itunes.apple.com")) {
    return null;
  }

  const match = path.match(/^\/[a-z]{2}\/(album|playlist|artist|song|music-video)\/([^/]+)\/(\d+)/);
  if (!match) return build("apple", "page", "Apple Music", host);

  const [, type, slug, id] = match;
  const label =
    type === "song" || type === "music-video"
      ? "Apple Music Song"
      : type === "album"
        ? "Apple Music Album"
        : type === "playlist"
          ? "Apple Music Playlist"
          : "Apple Music Artist";

  const embedType =
    type === "song" || type === "music-video"
      ? "song"
      : type === "playlist"
        ? "playlist"
        : type;

  return build(
    "apple",
    type === "artist"
      ? "artist"
      : type === "playlist"
        ? "playlist"
        : type === "album"
          ? "album"
          : "song",
    label,
    host,
    slugToTitle(slug),
    {
      provider: "apple",
      url: `https://embed.music.apple.com/us/${embedType}/${id}`
    }
  );
};

const parseDeezer = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("deezer.com")) return null;
  const match = path.match(/\/(track|album|playlist|artist)\/(\d+)/);
  if (!match) return build("deezer", "page", "Deezer", host);

  const [, type, id] = match;
  const label =
    type === "track"
      ? "Deezer Track"
      : type === "album"
        ? "Deezer Album"
        : type === "playlist"
          ? "Deezer Playlist"
          : "Deezer Artist";

  return build(
    "deezer",
    type as ProfileUrlResourceType,
    label,
    host,
    id,
    {
      provider: "deezer",
      url: `https://widget.deezer.com/widget/dark/${type}/${id}`
    }
  );
};

const parseBandcamp = (
  host: string,
  path: string,
  _href: string
): ResolvedProfileUrl | null => {
  if (!host.includes("bandcamp.com")) return null;

  const isArtistSubdomain =
    host.endsWith(".bandcamp.com") && host !== "bandcamp.com";

  if (path.includes("/album/")) {
    const detail = path.split("/album/")[1]?.split(/[/?#]/)[0];
    return build(
      "bandcamp",
      "album",
      "Bandcamp Album",
      host,
      detail ? slugToTitle(detail) : undefined
    );
  }

  if (path.includes("/track/")) {
    const detail = path.split("/track/")[1]?.split(/[/?#]/)[0];
    return build(
      "bandcamp",
      "track",
      "Bandcamp Track",
      host,
      detail ? slugToTitle(detail) : undefined
    );
  }

  if (isArtistSubdomain) {
    const artist = host.replace(".bandcamp.com", "");
    return build("bandcamp", "artist", "Bandcamp Artist", host, slugToTitle(artist));
  }

  return build("bandcamp", "page", "Bandcamp", host);
};

const parseGithub = (host: string, path: string): ResolvedProfileUrl | null => {
  if (host !== "github.com") return null;
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return build("github", "repository", "GitHub Repository", host, `${parts[0]}/${parts[1]}`);
  }
  if (parts.length === 1) {
    return build("github", "profile", "GitHub Profile", host, parts[0]);
  }
  return build("github", "page", "GitHub", host);
};

const parseDiscord = (host: string, path: string): ResolvedProfileUrl | null => {
  if (host === "discord.gg" || host.includes("discord.com")) {
    const invite = host === "discord.gg" ? path.slice(1) : path.match(/invite\/([\w-]+)/)?.[1];
    if (invite) return build("discord", "invite", "Discord Invite", host, invite);
    return build("discord", "page", "Discord", host);
  }
  return null;
};

const parseTwitter = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!["twitter.com", "x.com", "mobile.twitter.com"].includes(host)) return null;
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 3 && ["status", "post"].includes(parts[1])) {
    return build("twitter", "post", "X Post", host, `@${parts[0]}`);
  }
  if (parts.length >= 1) {
    return build("twitter", "profile", "X Profile", host, `@${parts[0]}`);
  }
  return build("twitter", "page", "X", host);
};

const parseInstagram = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("instagram.com")) return null;
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "p" || parts[0] === "reel") {
    return build("instagram", "post", "Instagram Post", host);
  }
  if (parts[0]) {
    return build("instagram", "profile", "Instagram Profile", host, `@${parts[0]}`);
  }
  return build("instagram", "page", "Instagram", host);
};

const parseTiktok = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("tiktok.com")) return null;
  if (path.includes("/video/")) {
    return build("tiktok", "video", "TikTok Video", host);
  }
  const handle = path.match(/^\/@([a-zA-Z0-9._]+)/)?.[1];
  if (handle) {
    return build("tiktok", "profile", "TikTok Profile", host, `@${handle}`);
  }
  return build("tiktok", "page", "TikTok", host);
};

const parseLinkedin = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("linkedin.com")) return null;
  if (path.startsWith("/in/")) {
    return build("linkedin", "profile", "LinkedIn Profile", host, path.split("/")[2]);
  }
  if (path.startsWith("/company/")) {
    return build("linkedin", "page", "LinkedIn Company", host, path.split("/")[2]);
  }
  return build("linkedin", "page", "LinkedIn", host);
};

const parseReddit = (host: string, path: string): ResolvedProfileUrl | null => {
  if (!host.includes("reddit.com")) return null;
  if (path.startsWith("/r/")) {
    return build("reddit", "page", "Subreddit", host, `r/${path.split("/")[2]}`);
  }
  if (path.startsWith("/u/") || path.startsWith("/user/")) {
    return build("reddit", "profile", "Reddit Profile", host, `u/${path.split("/")[2]}`);
  }
  return build("reddit", "page", "Reddit", host);
};

export const resolveProfileUrl = (url: string): ResolvedProfileUrl | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const path = parsed.pathname;
  const href = parsed.href;

  return (
    parseYoutube(parsed, host, path, href) ??
    parseTwitch(host, path) ??
    parseSpotify(host, path) ??
    parseSoundcloud(host, path, href) ??
    parseApple(host, path) ??
    parseDeezer(host, path) ??
    parseBandcamp(host, path, href) ??
    parseGithub(host, path) ??
    parseDiscord(host, path) ??
    parseTwitter(host, path) ??
    parseInstagram(host, path) ??
    parseTiktok(host, path) ??
    parseLinkedin(host, path) ??
    parseReddit(host, path) ??
    build(
      "website",
      "page",
      slugToTitle(host.split(".")[0] || "Website"),
      host,
      path !== "/" ? path : undefined
    )
  );
};

export const formatProfileUrlLabel = (resolved: ResolvedProfileUrl) =>
  resolved.detail ? `${resolved.label} · ${resolved.detail}` : resolved.label;

export const isGenericLinkLabel = (label: string) =>
  GENERIC_LABELS.has(label.trim().toLowerCase());

export const shouldAutoUpdateLinkLabel = (
  currentLabel: string,
  previousUrl?: string
) => {
  if (isGenericLinkLabel(currentLabel)) return true;
  if (!previousUrl) return false;
  const previous = resolveProfileUrl(previousUrl);
  if (!previous) return false;
  return (
    currentLabel.trim().toLowerCase() ===
      formatProfileUrlLabel(previous).trim().toLowerCase() ||
    currentLabel.trim().toLowerCase() === previous.label.trim().toLowerCase()
  );
};

export const getProfileLinkKindLabel = (kind: ProfileLinkKind) => {
  switch (kind) {
    case "youtube":
      return "YouTube";
    case "twitch":
      return "Twitch";
    case "spotify":
      return "Spotify";
    case "soundcloud":
      return "SoundCloud";
    case "apple":
      return "Apple Music";
    case "deezer":
      return "Deezer";
    case "bandcamp":
      return "Bandcamp";
    case "github":
      return "GitHub";
    case "discord":
      return "Discord";
    case "twitter":
      return "X / Twitter";
    case "instagram":
      return "Instagram";
    case "tiktok":
      return "TikTok";
    case "linkedin":
      return "LinkedIn";
    case "reddit":
      return "Reddit";
    default:
      return "Website";
  }
};
