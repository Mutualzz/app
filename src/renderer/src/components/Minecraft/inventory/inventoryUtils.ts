import type { BridgeInventory, InventorySlot } from "@hooks/useBridgeInventory";
import type {
  InventoryEdit,
  InventoryEditAck,
  SlotContainer,
  SlotRef
} from "@renderer/hooks/useInventoryEdits";
import type { InventoryEditOp } from "@mutualzz/validators";
import type { ArmorPieces } from "../armor";

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

export const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const itemName = (type: string) =>
  type
    .replace(/^minecraft:/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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

export const toRef = (key: string): SlotRef => {
  const [container, slot] = key.split(":");
  return { container: container as SlotContainer, slot: Number(slot) };
};

export const itemAt = (
  view: { inventory: InventorySlot[]; enderChest: InventorySlot[] },
  key: string
) => {
  const ref = toRef(key);
  return view[ref.container].find((item) => item.slot === ref.slot);
};
