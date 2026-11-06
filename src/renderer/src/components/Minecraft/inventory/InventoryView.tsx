import { Paper } from "@components/Paper";
import type { BridgeInventory } from "@hooks/useBridgeInventory";
import { useAppStore } from "@hooks/useStores";
import { Stack, Typography } from "@mutualzz/ui-web";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PlayerModel } from "../PlayerModel";
import { armorOf, type ServerEditing } from "./inventoryUtils";
import { ServerInventory } from "./ServerInventory";

interface InventoryViewProps {
  name: string;
  minecraftUuid?: string;
  inventories: BridgeInventory[];
  isLoading: boolean;
  live: boolean;
  emptyMessage: string | null;
  actions?: ReactNode;
  labelFor: (serverId: string) => string;
  editingFor?: (serverId: string) => ServerEditing | undefined;
}

export const InventoryView = observer(
  ({
    name,
    minecraftUuid,
    inventories,
    isLoading,
    live,
    emptyMessage,
    actions,
    labelFor,
    editingFor
  }: InventoryViewProps) => {
    const app = useAppStore();
    const { t } = useTranslation("settings");

    return (
      <Paper
        surfaceRole="modal"
        elevation={app.settings?.preferEmbossed ? 5 : 1}
        p={5}
        borderRadius={12}
        direction="column"
        spacing={4}
      >
        <Typography level="h5" fontWeight="bold">
          {t("minecraftBridge.inventoryTitle", { name })}
        </Typography>
        {actions}

        {!isLoading && emptyMessage && (
          <Typography level="body-sm" textColor="muted">
            {emptyMessage}
          </Typography>
        )}
        <Stack direction="row" spacing={5} alignItems="flex-start">
          <Stack direction="column" spacing={4}>
            {inventories.map((snapshot) => (
              <ServerInventory
                key={snapshot.serverId}
                snapshot={snapshot}
                live={live}
                serverLabel={labelFor(snapshot.serverId)}
                editing={editingFor?.(snapshot.serverId)}
              />
            ))}
          </Stack>
          {minecraftUuid && (
            <PlayerModel uuid={minecraftUuid} armor={armorOf(inventories[0])} />
          )}
        </Stack>
        <Typography level="body-xs" textColor="muted">
          {t("minecraftBridge.inventoryDisclaimer")}
        </Typography>
      </Paper>
    );
  }
);
