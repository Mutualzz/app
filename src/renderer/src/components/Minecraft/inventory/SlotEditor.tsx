import type { InventorySlot } from "@hooks/useBridgeInventory";
import { Button, Input, Stack, Typography } from "@mutualzz/ui-web";
import type { InventoryEditOp } from "@mutualzz/validators";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { itemName, toRef } from "./inventoryUtils";

export const SlotEditor = ({
  slotKey,
  item,
  onRun
}: {
  slotKey: string;
  item?: InventorySlot;
  onRun: (op: InventoryEditOp) => void;
}) => {
  const { t } = useTranslation("settings");
  const ref = toRef(slotKey);
  const [amount, setAmount] = useState(String(item?.amount ?? 1));
  const [type, setType] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  const parsedAmount = Math.max(
    1,
    Math.min(99, Number.parseInt(amount, 10) || 1)
  );
  const itemId = type
    .trim()
    .toLowerCase()
    .replace(/^minecraft:/, "")
    .replace(/\s+/g, "_");
  const validType = /^[a-z0-9_]{1,64}$/.test(itemId);

  const amountInput = (
    <div style={{ width: 90 }}>
      <Input
        size="sm"
        fullWidth
        type="number"
        min={1}
        max={99}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
  );

  if (!item) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Input
          size="sm"
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder={t("minecraftBridge.inventoryGivePlaceholder")}
        />
        {amountInput}
        <Button
          size="sm"
          disabled={!validType}
          onClick={() =>
            onRun({
              kind: "give",
              ...ref,
              type: `minecraft:${itemId}`,
              amount: parsedAmount
            })
          }
        >
          {t("minecraftBridge.inventoryGive")}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography level="body-sm">{itemName(item.type)}</Typography>
      {amountInput}
      <Button
        size="sm"
        variant="soft"
        disabled={parsedAmount === item.amount}
        onClick={() => onRun({ kind: "amount", ...ref, amount: parsedAmount })}
      >
        {t("minecraftBridge.inventorySetAmount")}
      </Button>
      <Button
        size="sm"
        color="danger"
        variant={confirmRemove ? "solid" : "soft"}
        onClick={() =>
          confirmRemove
            ? onRun({ kind: "remove", ...ref })
            : setConfirmRemove(true)
        }
      >
        {confirmRemove
          ? t("minecraftBridge.inventoryRemoveConfirm")
          : t("minecraftBridge.inventoryRemove")}
      </Button>
    </Stack>
  );
};
