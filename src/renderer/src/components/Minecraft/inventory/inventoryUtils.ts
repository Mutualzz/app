import type {
  BridgeInventory,
  InventoryEdit,
  InventoryEditAck
} from "@mutualzz/client";
import type { InventoryEditOp } from "@mutualzz/validators";
import type { ArmorPieces } from "../armor";

export { itemAt, itemName, range, toSlotRef as toRef } from "@mutualzz/client";

export const SLOT_SIZE = 52;

export interface ServerEditing {
  edits: InventoryEdit[];
  recentResults: InventoryEdit[];
  send: (op: InventoryEditOp) => Promise<InventoryEditAck>;
  cancel: (editId: string) => Promise<InventoryEditAck>;
}

export type SlotFlash = Map<string, boolean>;

export interface SlotEditing {
  pending: Set<string>;
  selected: string | null;
  onSelect: (key: string) => void;
  live: boolean;
  flash: SlotFlash | null;
}

export const armorOf = (snapshot?: BridgeInventory): ArmorPieces => {
  const bySlot = new Map(
    (snapshot?.inventory ?? []).map((item) => [item.slot, item])
  );
  return {
    head: bySlot.get(39),
    chest: bySlot.get(38),
    legs: bySlot.get(37),
    feet: bySlot.get(36)
  };
};
