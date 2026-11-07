import {
  EMPTY_EDITS,
  inventoryEditsQueryKey,
  type InventoryEditsState
} from "@mutualzz/client";
import { useQuery } from "@tanstack/react-query";

export {
  applyEditUpdates,
  editSlotKeys,
  EMPTY_EDITS,
  inventoryEditsQueryKey,
  projectInventory,
  type InventoryEdit,
  type InventoryEditAck,
  type InventoryEditsState,
  type SlotContainer,
  type SlotRef
} from "@mutualzz/client";

export const useInventoryEdits = (bridgeId: string, minecraftUuid: string) => {
  const { data } = useQuery<InventoryEditsState>({
    queryKey: inventoryEditsQueryKey(bridgeId, minecraftUuid),
    queryFn: () => EMPTY_EDITS,
    staleTime: Infinity
  });
  return data ?? EMPTY_EDITS;
};
