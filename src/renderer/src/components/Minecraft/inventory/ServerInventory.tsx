import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import type { BridgeInventory, InventorySlot } from "@hooks/useBridgeInventory";
import { Stack, Typography } from "@mutualzz/ui-web";
import type { InventoryEditOp } from "@mutualzz/validators";
import {
  editSlotKeys,
  projectInventory
} from "@renderer/hooks/useInventoryEdits";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { SlotIcon } from "./ItemIcons";
import {
  itemAt,
  range,
  type ServerEditing,
  SLOT_SIZE,
  type SlotEditing,
  type SlotFlash,
  toRef
} from "./inventoryUtils";
import { PendingEditList, PendingEditsBar } from "./PendingEdits";
import { SlotEditor } from "./SlotEditor";
import { SlotGrid } from "./SlotGrid";

export const ServerInventory = ({
  snapshot,
  live,
  serverLabel,
  editing
}: {
  snapshot: BridgeInventory;
  live: boolean;
  serverLabel: string;
  editing?: ServerEditing;
}) => {
  const { t } = useTranslation("settings");
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<InventorySlot | null>(null);
  const [flash, setFlash] = useState<SlotFlash | null>(null);
  const myEdits = useRef(new Set<string>());
  const results = editing?.recentResults ?? [];
  const resultsKey = results.map((r) => `${r.id}:${r.status}`).join(",");
  const seenResults = useRef(resultsKey);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const view = useMemo(
    () =>
      editing
        ? projectInventory(snapshot, editing.edits)
        : {
            inventory: snapshot.inventory,
            enderChest: snapshot.enderChest,
            pending: new Set<string>()
          },
    [snapshot, editing?.edits]
  );

  const run = async (op: InventoryEditOp) => {
    if (!editing) return;
    const ack = await editing.send(op);
    if (!ack.ok) {
      toast.error(ack.message);
      return;
    }
    if (ack.edit) myEdits.current.add(ack.edit.id);
  };

  const cancel = async (editId: string) => {
    if (!editing) return;
    const ack = await editing.cancel(editId);
    if (!ack.ok) {
      toast.error(ack.message);
      return;
    }
    toast.success(
      t("minecraftBridge.inventoryEditsCancelled", {
        count: ack.cancelled ?? 1
      })
    );
  };

  useEffect(() => {
    if (!resultsKey || resultsKey === seenResults.current) return;
    seenResults.current = resultsKey;

    const finished = results.filter((r) => r.status !== "cancelled");
    if (finished.length === 0) return;

    const next: SlotFlash = new Map();
    for (const r of finished) {
      for (const key of editSlotKeys(r.op)) {
        next.set(key, (next.get(key) ?? true) && r.status === "applied");
      }
    }
    setFlash(next);

    const rejected = finished
      .filter((r) => r.status === "rejected" && myEdits.current.has(r.id))
      .sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
    if (rejected.length > 0) {
      toast.error(
        t(
          rejected.length > 1
            ? "minecraftBridge.inventoryEditRejectedMore"
            : "minecraftBridge.inventoryEditRejected",
          { message: rejected[0].message ?? "", count: rejected.length - 1 }
        )
      );
    }
    for (const r of results) myEdits.current.delete(r.id);

    const timer = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(timer);
  }, [resultsKey, t]);

  const onDragStart = ({ active }: DragStartEvent) => {
    setDragging(
      (active.data.current?.item as InventorySlot | undefined) ?? null
    );
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    if (!over || over.id === active.id) return;
    void run({
      kind: "move",
      from: toRef(String(active.id)),
      to: toRef(String(over.id))
    });
  };

  const slotEditing: SlotEditing | undefined = editing && {
    pending: view.pending,
    selected,
    onSelect: (key) => setSelected((current) => (current === key ? null : key)),
    live,
    flash
  };

  const selectedItem = selected ? itemAt(view, selected) : undefined;
  const slotEdits =
    editing && selected
      ? editing.edits.filter((edit) => editSlotKeys(edit.op).includes(selected))
      : [];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <Stack direction="column" spacing={3}>
        <Typography level="body-xs" textColor="muted">
          {serverLabel} ·{" "}
          {live
            ? t("minecraftBridge.inventoryLive")
            : t("minecraftBridge.inventoryLastSeen", {
                time: new Date(snapshot.capturedAt).toLocaleString()
              })}
        </Typography>

        {editing && !live && (
          <Typography level="body-xs" color="warning">
            {t("minecraftBridge.inventoryEditOffline")}
          </Typography>
        )}

        {editing && (
          <PendingEditsBar
            edits={editing.edits}
            onCancel={(id) => void cancel(id)}
          />
        )}

        <Typography level="label-sm">
          {t("minecraftBridge.inventoryArmor")}
        </Typography>
        <SlotGrid
          slots={view.inventory}
          container="inventory"
          indexes={[39, 38, 37, 36, 40]}
          columns={5}
          editing={slotEditing}
        />

        <Typography level="label-sm">
          {t("minecraftBridge.inventoryMain")}
        </Typography>
        <SlotGrid
          slots={view.inventory}
          container="inventory"
          indexes={range(9, 35)}
          editing={slotEditing}
        />
        <SlotGrid
          slots={view.inventory}
          container="inventory"
          indexes={range(0, 8)}
          editing={slotEditing}
        />

        <Typography level="label-sm">
          {t("minecraftBridge.inventoryEnderChest")}
        </Typography>
        <SlotGrid
          slots={view.enderChest}
          container="enderChest"
          indexes={range(0, 26)}
          editing={slotEditing}
        />

        {editing && selected && (
          <Stack direction="column" spacing={1}>
            <SlotEditor
              key={`${selected}:${selectedItem?.type ?? ""}:${selectedItem?.amount ?? 0}`}
              slotKey={selected}
              item={selectedItem}
              onRun={(op) => void run(op)}
            />
            {slotEdits.length > 0 && (
              <>
                <Typography level="label-sm">
                  {t("minecraftBridge.inventorySlotPending")}
                </Typography>
                <PendingEditList
                  edits={slotEdits}
                  queue={editing.edits}
                  onCancel={(id) => void cancel(id)}
                />
              </>
            )}
          </Stack>
        )}
      </Stack>

      <DragOverlay dropAnimation={null} zIndex={10000}>
        {dragging && (
          <div
            style={{
              width: SLOT_SIZE,
              height: SLOT_SIZE,
              display: "grid",
              placeItems: "center",
              cursor: "grabbing"
            }}
          >
            <SlotIcon type={dragging.type} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
