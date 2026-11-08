import type { AppStore } from "@stores/App.store";
import type { useNavigate } from "@tanstack/react-router";

export type AppNavigateFunction = ReturnType<typeof useNavigate>;

export const openChannelMessage = (
  app: AppStore,
  navigate: AppNavigateFunction,
  channelId: string,
  messageId?: string
) => {
  const channel = app.channels.get(channelId);
  if (!channel) return;

  if (channel.space)
    navigate({
      to: "/spaces/$spaceId/$channelId",
      params: { spaceId: channel.space.id, channelId }
    });
  else navigate({ to: "/@me/$channelId", params: { channelId } });

  if (messageId) app.requestJumpToMessage(channelId, messageId);
};
