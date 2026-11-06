import {
  inventoryQueryKey,
  useMyBridgeInventory,
  usePlayerBridgeInventory
} from "@hooks/useBridgeInventory";
import { useAppStore } from "@hooks/useStores";
import { Button } from "@mutualzz/ui-web";
import { useModal } from "@renderer/contexts/Modal.context";
import { useBridgeServerLabel } from "@renderer/hooks/useBridgeServerLabel";
import { useInventoryEdits } from "@renderer/hooks/useInventoryEdits";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InventoryView } from "../Minecraft/inventory/InventoryView";
import type { ServerEditing } from "../Minecraft/inventory/inventoryUtils";

export const BridgeInventoryModal = observer(
  ({ bridgeId }: { bridgeId: string }) => {
    const { t } = useTranslation("settings");
    const { link, inventories, isLoading, live } =
      useMyBridgeInventory(bridgeId);
    const labelFor = useBridgeServerLabel(bridgeId);

    const emptyMessage = !link
      ? t("minecraftBridge.inventoryNotLinked")
      : inventories.length === 0
        ? t("minecraftBridge.inventoryEmpty")
        : null;

    return (
      <InventoryView
        name={link?.minecraftName ?? ""}
        minecraftUuid={link?.minecraftUuid}
        inventories={inventories}
        isLoading={isLoading}
        live={live}
        emptyMessage={emptyMessage}
        labelFor={labelFor}
      />
    );
  }
);

export const PlayerInventoryModal = observer(
  ({
    bridgeId,
    spaceId,
    minecraftUuid,
    minecraftName
  }: {
    bridgeId: string;
    spaceId: string;
    minecraftUuid: string;
    minecraftName: string;
  }) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const queryClient = useQueryClient();
    const { closeModal } = useModal();
    const [confirming, setConfirming] = useState(false);
    const { inventories, isLoading, live } = usePlayerBridgeInventory(
      bridgeId,
      spaceId,
      minecraftUuid
    );
    const labelFor = useBridgeServerLabel(bridgeId);

    const editsState = useInventoryEdits(bridgeId, minecraftUuid);

    const editingFor = (serverId: string): ServerEditing | undefined =>
      editsState.editableServers.includes(serverId)
        ? {
            edits: editsState.edits.filter(
              (edit) => edit.serverId === serverId
            ),
            recentResults: editsState.recentResults.filter(
              (edit) => edit.serverId === serverId
            ),
            send: (op) =>
              app.gateway.editInventory(bridgeId, minecraftUuid, serverId, op),
            cancel: (editId) =>
              app.gateway.cancelInventoryEdit(bridgeId, editId)
          }
        : undefined;

    const { mutate: deleteSnapshot, isPending } = useMutation({
      mutationFn: () =>
        app.rest.delete(
          `/spaces/${spaceId}/bridge/inventories/${minecraftUuid}`
        ),
      onSuccess: () => {
        queryClient.removeQueries({
          queryKey: inventoryQueryKey(bridgeId, minecraftUuid)
        });
        void queryClient.invalidateQueries({
          queryKey: ["bridges", bridgeId, "inventories", "known"]
        });
        closeModal();
      }
    });

    return (
      <InventoryView
        name={minecraftName}
        minecraftUuid={minecraftUuid}
        inventories={inventories}
        isLoading={isLoading}
        live={live}
        emptyMessage={
          inventories.length === 0
            ? t("minecraftBridge.inventoryEmptyPlayer", { name: minecraftName })
            : null
        }
        labelFor={labelFor}
        editingFor={editingFor}
        actions={
          inventories.length > 0 && (
            <Button
              size="sm"
              variant={confirming ? "solid" : "soft"}
              color="danger"
              disabled={isPending}
              onClick={() =>
                confirming ? deleteSnapshot() : setConfirming(true)
              }
            >
              {confirming
                ? t("minecraftBridge.inventoryDeleteConfirm")
                : t("minecraftBridge.inventoryDelete")}
            </Button>
          )
        }
      />
    );
  }
);
