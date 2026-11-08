import { ChannelType } from "@mutualzz/types";
import type { Channel } from "@stores/objects/Channel";
import type { TFunction } from "i18next";

export const channelLocationLabel = (
  channel: Channel | undefined,
  translate: TFunction
) => {
  if (!channel) return translate("chat:unknown");
  if (channel.space) return `${channel.space.name} · #${channel.name}`;
  if (channel.type === ChannelType.DM)
    return channel.dmRecipient?.displayName ?? translate("chat:deletedUser");
  return (
    channel.name ||
    channel.dmRecipientsList.map((user) => user.displayName).join(", ")
  );
};
