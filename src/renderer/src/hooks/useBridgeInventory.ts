import { useAppStore } from "@hooks/useStores";
import { type BridgeInventory, inventoryQueryKey } from "@mutualzz/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export {
  inventoryQueryKey,
  type BridgeInventory,
  type InventorySlot
} from "@mutualzz/client";

interface MinecraftLink {
  minecraftUuid: string;
  minecraftName: string;
}

const useInventorySubscription = (
  bridgeId: string,
  minecraftUuid: string | undefined
) => {
  const app = useAppStore();

  useEffect(() => {
    if (!minecraftUuid) return;
    app.gateway.subscribeInventory(bridgeId, minecraftUuid);
    return () => app.gateway.unsubscribeInventory(bridgeId, minecraftUuid);
  }, [app, bridgeId, minecraftUuid]);

  const uuid = minecraftUuid?.toLowerCase();
  return Boolean(
    uuid &&
    app.bridgeChat
      .playersFor(bridgeId)
      .some((player) => player.uuid.toLowerCase() === uuid)
  );
};

export const useMyBridgeInventory = (bridgeId: string) => {
  const app = useAppStore();

  const linkQuery = useQuery({
    queryKey: ["me", "bridges", "link"],
    queryFn: () => app.rest.get<MinecraftLink | null>("/@me/bridges/link")
  });
  const minecraftUuid = linkQuery.data?.minecraftUuid;

  const inventoryQuery = useQuery({
    queryKey: inventoryQueryKey(bridgeId, minecraftUuid ?? ""),
    queryFn: () =>
      app.rest.get<BridgeInventory[]>(
        `/@me/bridges/${bridgeId}/inventories/@me`
      ),
    enabled: Boolean(minecraftUuid),
    staleTime: Infinity
  });

  const live = useInventorySubscription(bridgeId, minecraftUuid);

  return {
    link: linkQuery.data ?? null,
    inventories: inventoryQuery.data ?? [],
    isLoading: linkQuery.isLoading || inventoryQuery.isLoading,
    live
  };
};

export const usePlayerBridgeInventory = (
  bridgeId: string,
  spaceId: string,
  minecraftUuid: string
) => {
  const app = useAppStore();
  const base = `/spaces/${spaceId}/bridge/inventories/${minecraftUuid}`;

  const inventoryQuery = useQuery({
    queryKey: inventoryQueryKey(bridgeId, minecraftUuid),
    queryFn: () => app.rest.get<BridgeInventory[]>(base),
    retry: false
  });
  const live = useInventorySubscription(bridgeId, minecraftUuid);

  return {
    inventories: inventoryQuery.data ?? [],
    isLoading: inventoryQuery.isLoading,
    live
  };
};
