import type { Channel } from "@stores/objects/Channel";
import { useNavigate } from "@tanstack/react-router";

export function useOpenChannel() {
  const navigate = useNavigate();

  return (channel: Channel) => {
    if (channel.spaceId) {
      navigate({
        to: "/spaces/$spaceId/$channelId",
        params: { spaceId: channel.spaceId, channelId: channel.id }
      });
      return;
    }

    navigate({ to: "/@me/$channelId", params: { channelId: channel.id } });
  };
}
