import { Button, Stack, Typography } from "@mutualzz/ui-web";
import type { InventoryEditOp } from "@mutualzz/validators";
import { ClockIcon } from "@phosphor-icons/react";
import type { InventoryEdit, SlotRef } from "@renderer/hooks/useInventoryEdits";
import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { itemName } from "./inventoryUtils";

const describeEdit = (op: InventoryEditOp, t: TFunction<"settings">) => {
  const slotLabel = (ref: SlotRef) =>
    t(
      ref.container === "enderChest"
        ? "minecraftBridge.inventoryEditSlotEnder"
        : "minecraftBridge.inventoryEditSlot",
      { slot: ref.slot }
    );

  switch (op.kind) {
    case "move":
      return `${slotLabel(op.from)} → ${slotLabel(op.to)}`;
    case "remove":
      return t("minecraftBridge.inventoryEditRemove", { slot: slotLabel(op) });
    case "amount":
      return t("minecraftBridge.inventoryEditAmount", {
        slot: slotLabel(op),
        amount: op.amount
      });
    case "give":
      return t("minecraftBridge.inventoryEditGive", {
        slot: slotLabel(op),
        amount: op.amount,
        item: itemName(op.type)
      });
  }
};

export const PendingEditList = ({
  edits,
  queue,
  onCancel
}: {
  edits: InventoryEdit[];
  queue: InventoryEdit[];
  onCancel: (editId: string) => void;
}) => {
  const { t } = useTranslation("settings");

  return (
    <Stack direction="column" spacing={0.5}>
      {edits.map((edit) => {
        const later =
          queue.length - queue.findIndex((entry) => entry.id === edit.id) - 1;
        return (
          <Stack
            key={edit.id}
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography level="body-xs" textColor="muted">
              {describeEdit(edit.op, t)}
            </Typography>
            <Button size="sm" variant="plain" onClick={() => onCancel(edit.id)}>
              {later > 0
                ? t("minecraftBridge.inventoryCancelEditWithLater", {
                    count: later
                  })
                : t("minecraftBridge.inventoryCancelEdit")}
            </Button>
          </Stack>
        );
      })}
    </Stack>
  );
};

export const PendingEditsBar = ({
  edits,
  onCancel
}: {
  edits: InventoryEdit[];
  onCancel: (editId: string) => void;
}) => {
  const { t } = useTranslation("settings");
  const [open, setOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  if (edits.length === 0) return null;

  const cancelAll = () => {
    if (!confirmAll) {
      setConfirmAll(true);
      return;
    }
    setConfirmAll(false);
    onCancel(edits[0].id);
  };

  return (
    <Stack direction="column" spacing={1}>
      <Stack direction="row" spacing={2} alignItems="center">
        <ClockIcon size={14} />
        <Typography level="body-xs">
          {t("minecraftBridge.inventoryPendingEdits", { count: edits.length })}
        </Typography>
        <Button size="sm" variant="plain" onClick={() => setOpen((o) => !o)}>
          {open
            ? t("minecraftBridge.inventoryPendingHide")
            : t("minecraftBridge.inventoryPendingShow")}
        </Button>
        <Button
          size="sm"
          color="danger"
          variant={confirmAll ? "solid" : "plain"}
          onClick={cancelAll}
        >
          {confirmAll
            ? t("minecraftBridge.inventoryCancelAllConfirm")
            : t("minecraftBridge.inventoryCancelAll")}
        </Button>
      </Stack>
      {open && (
        <div style={{ maxHeight: 160, overflowY: "auto" }}>
          <PendingEditList edits={edits} queue={edits} onCancel={onCancel} />
        </div>
      )}
    </Stack>
  );
};
