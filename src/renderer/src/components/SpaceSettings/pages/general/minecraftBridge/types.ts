export type BridgeTab = "bridges" | "discord" | "voice" | "link";

export const tabs: BridgeTab[] = ["bridges", "discord", "voice", "link"];

export const BRIDGE_LIMIT = 5;

export interface BridgeSummary {
  id: string;
  name: string;
  status: number;
  role?: "admin" | "member";
  spaceId?: string;
  createdAt: string;
  hubConnected?: boolean;
  onlineCount?: number;
}

export interface BridgeMemberRow {
  userId: string;
  role: "admin" | "member";
  username: string;
  globalName: string | null;
  avatar: string | null;
  joinedAt: string;
  online: boolean;
  minecraftUuid: string | null;
  minecraftName: string | null;
}

export interface BridgeBanRow {
  minecraftUuid: string;
  minecraftName: string;
  reason: string | null;
  createdAt: string;
  bannedBy: {
    id: string;
    username: string | null;
    globalName: string | null;
  } | null;
}

export interface PluginConfig {
  hubUrl: string;
  token: string;
  serverId: string;
}

export interface BridgeDetail extends BridgeSummary {
  hubConnected: boolean;
  connectedServers: string[];
  servers: {
    id: string;
    serverId: string;
    displayName: string;
    lastSeenAt?: string | null;
  }[];
  discordBindings: {
    id: string;
    serverId: string;
    guildId: string;
    channelId: string;
    guildName?: string | null;
    channelName?: string | null;
    hasWebhook: boolean;
  }[];
  voiceBindings: {
    id: string;
    serverId: string;
    name: string;
    spaceId: string;
    channelId: string;
  }[];
  tokens: {
    id: string;
    name: string;
    tokenPrefix: string;
    lastUsedAt: string | null;
    createdAt: string;
  }[];
}

export interface MinecraftLink {
  minecraftUuid: string;
  minecraftName: string;
  discordId: string | null;
  createdAt: string;
}

export interface DiscordStatus {
  botInviteUrl: string | null;
}

export const sanitizeServerId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

export const isDiscordSnowflake = (value: string) =>
  /^\d{17,20}$/.test(value.trim());

export const looksLikeDiscordSnowflake = (value: string) =>
  /^\d{16,22}$/.test(value.trim());

export const pluginConfigYaml = (config: PluginConfig) =>
  `hubUrl: ${config.hubUrl}\ntoken: ${config.token}\nserverId: ${config.serverId}\n`;

export const pluginConfigTemplateYaml = (serverId: string) =>
  `hubUrl: ws://localhost:3015\ntoken: YOUR_TOKEN_HERE\nserverId: ${serverId || "my-server"}\n`;

export const formatLastSeen = (iso?: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
};

export const knownServerIdsOf = (detail?: BridgeDetail) =>
  [
    ...new Set([
      ...(detail?.servers.map((s) => s.serverId) ?? []),
      ...(detail?.connectedServers ?? []),
      ...(detail?.discordBindings.map((b) => b.serverId) ?? []),
      ...(detail?.voiceBindings?.map((b) => b.serverId) ?? [])
    ])
  ].filter(Boolean);
