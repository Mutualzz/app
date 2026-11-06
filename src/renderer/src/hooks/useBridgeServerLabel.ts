import { useAppStore } from "@hooks/useStores";
import { minecraftServerLabel } from "@mutualzz/client";
import { useQuery } from "@tanstack/react-query";

interface BridgeServerInfo {
  serverId: string;
  displayName: string;
}

export const useBridgeServerLabel = (bridgeId: string) => {
  const app = useAppStore();
  const { data } = useQuery({
    queryKey: ["me", "bridges", bridgeId],
    queryFn: () =>
      app.rest.get<{ servers?: BridgeServerInfo[] }>(
        `/@me/bridges/${bridgeId}`
      ),
    staleTime: 60_000
  });

  return (serverId: string) =>
    minecraftServerLabel(
      data?.servers?.find((server) => server.serverId === serverId) ?? {
        serverId
      }
    );
};
