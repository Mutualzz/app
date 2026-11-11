const PENDING_GUILD_KEY = "discord-import-guild";
export const DISCORD_IMPORT_GUILD_EVENT = "discord-import-guild";

export function returnToDiscordImport(guildId: string) {
  sessionStorage.setItem(PENDING_GUILD_KEY, guildId);
  sessionStorage.setItem("settings-return", "discord-import");
  window.dispatchEvent(new Event("settings-return"));
  window.dispatchEvent(new Event(DISCORD_IMPORT_GUILD_EVENT));
}

export function hasPendingDiscordImportGuild() {
  return sessionStorage.getItem(PENDING_GUILD_KEY) !== null;
}

export function takePendingDiscordImportGuild() {
  const guildId = sessionStorage.getItem(PENDING_GUILD_KEY);
  if (guildId) sessionStorage.removeItem(PENDING_GUILD_KEY);
  return guildId;
}
