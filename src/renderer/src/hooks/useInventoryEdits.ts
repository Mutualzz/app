import type { InventoryEditOp } from "@mutualzz/validators";
import { useQuery } from "@tanstack/react-query";
import type { BridgeInventory, InventorySlot } from "./useBridgeInventory";

export type SlotRef = Extract<InventoryEditOp, { kind: "move" }>["from"];
export type SlotContainer = SlotRef["container"];

export interface InventoryEdit {
  id: string;
  serverId: string;
  minecraftUuid: string;
  op: InventoryEditOp;
  status: "pending" | "applied" | "rejected" | "cancelled";
  message: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export type InventoryEditAck =
  | { ok: true; edit?: InventoryEdit; cancelled?: number }
  | { ok: false; message: string };

export interface InventoryEditsState {
  edits: InventoryEdit[];
  editableServers: string[];
  recentResults: InventoryEdit[];
}

export const EMPTY_EDITS: InventoryEditsState = {
  edits: [],
  editableServers: [],
  recentResults: []
};

export const inventoryEditsQueryKey = (
  bridgeId: string,
  minecraftUuid: string
) =>
  ["bridges", bridgeId, "inventoryEdits", minecraftUuid.toLowerCase()] as const;

const keyOf = (ref: SlotRef) => `${ref.container}:${ref.slot}`;

export const editSlotKeys = (op: InventoryEditOp) =>
  op.kind === "move" ? [keyOf(op.from), keyOf(op.to)] : [keyOf(op)];

export const useInventoryEdits = (bridgeId: string, minecraftUuid: string) => {
  const { data } = useQuery({
    queryKey: inventoryEditsQueryKey(bridgeId, minecraftUuid),
    queryFn: () => EMPTY_EDITS,
    staleTime: Infinity
  });
  return data ?? EMPTY_EDITS;
};

export const applyEditUpdates = (
  state: InventoryEditsState,
  updates: InventoryEdit[]
): InventoryEditsState => {
  const finished = updates.filter((edit) => edit.status !== "pending");
  const finishedIds = new Set(
    [...finished, ...state.recentResults].map((edit) => edit.id)
  );
  const changed = new Set(updates.map((edit) => edit.id));

  const edits = [
    ...state.edits.filter((edit) => !changed.has(edit.id)),
    ...updates.filter(
      (edit) => edit.status === "pending" && !finishedIds.has(edit.id)
    )
  ].sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));

  return {
    ...state,
    edits,
    recentResults: finished.length > 0 ? finished : state.recentResults
  };
};

export const projectInventory = (
  snapshot: BridgeInventory,
  edits: InventoryEdit[]
) => {
  const slots = new Map<string, InventorySlot | undefined>();
  for (const item of snapshot.inventory)
    slots.set(`inventory:${item.slot}`, item);
  for (const item of snapshot.enderChest)
    slots.set(`enderChest:${item.slot}`, item);
  const pending = new Set<string>();

  for (const { op } of edits.filter(
    (edit) => edit.serverId === snapshot.serverId && edit.status === "pending"
  )) {
    if (op.kind === "move") {
      const from = keyOf(op.from);
      const to = keyOf(op.to);
      const moving = slots.get(from);
      slots.set(from, slots.get(to));
      slots.set(to, moving);
      pending.add(from).add(to);
      continue;
    }

    const key = keyOf(op);
    const current = slots.get(key);
    if (op.kind === "remove") slots.set(key, undefined);
    if (op.kind === "amount" && current) {
      slots.set(key, { ...current, amount: op.amount });
    }
    if (op.kind === "give") {
      slots.set(key, { slot: op.slot, type: op.type, amount: op.amount });
    }
    pending.add(key);
  }

  const collect = (container: SlotContainer) =>
    [...slots].flatMap(([key, item]) =>
      item && key.startsWith(`${container}:`)
        ? [{ ...item, slot: Number(key.slice(container.length + 1)) }]
        : []
    );

  return {
    inventory: collect("inventory"),
    enderChest: collect("enderChest"),
    pending
  };
};
