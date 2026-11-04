import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import {
  inventoryQueryKey,
  useMyBridgeInventory,
  usePlayerBridgeInventory,
  type BridgeInventory,
  type InventorySlot
} from "@hooks/useBridgeInventory";
import { useAppStore } from "@hooks/useStores";
import { Button, Stack, Typography } from "@mutualzz/ui-web";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlayerModel } from "../Minecraft/PlayerModel";
import { useModal } from "@renderer/contexts/Modal.context";

const SLOT_SIZE = 52;
const ICON_SIZE = 32;
const ASSET_ROOT = "https://assets.mcasset.cloud/26.1.2/assets/minecraft";
const TEXTURE_BASE = `${ASSET_ROOT}/textures`;
const CUBE_SIZE = 20;

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const itemName = (type: string) =>
  type
    .replace(/^minecraft:/, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

interface BlockFaces {
  up: string;
  north: string;
  east: string;
}

interface ModelJson {
  parent?: string;
  textures?: Record<string, string>;
}

const stripNamespace = (ref: string) => ref.replace(/^minecraft:/, "");

const fetchJson = async <T,>(path: string): Promise<T | null> => {
  const res = await fetch(`${ASSET_ROOT}/${path}`);
  return res.ok ? ((await res.json()) as T) : null;
};

const resolveCube = async (modelRef: string): Promise<BlockFaces | null> => {
  const textures: Record<string, string> = {};
  let current: string | undefined = stripNamespace(modelRef);

  for (let depth = 0; current && depth < 8; depth++) {
    if (current === "block/cube") break;
    const model = await fetchJson<ModelJson>(`models/${current}.json`);
    if (!model) return null;
    const modelTextures: Record<string, string> = model.textures ?? {};
    for (const [key, value] of Object.entries(modelTextures)) {
      if (!(key in textures)) textures[key] = value;
    }
    current = model.parent ? stripNamespace(model.parent) : undefined;
  }
  if (current !== "block/cube") return null;

  const resolve = (key: string): string | null => {
    let value = textures[key];
    for (let i = 0; value?.startsWith("#") && i < 8; i++) {
      value = textures[value.slice(1)];
    }
    return value ? `${TEXTURE_BASE}/${stripNamespace(value)}.png` : null;
  };

  const up = resolve("up");
  const north = resolve("north");
  const east = resolve("east");
  return up && north && east ? { up, north, east } : null;
};

const fetchBlockFaces = async (id: string): Promise<BlockFaces | null> => {
  const item = await fetchJson<{
    model?: { type?: string; model?: string };
  }>(`items/${id}.json`);
  const model = item?.model;
  if (!model) return null;

  if (model.type === "minecraft:special" && id.endsWith("shulker_box")) {
    const texture = `${TEXTURE_BASE}/block/${id}.png`;
    return { up: texture, north: texture, east: texture };
  }
  if (
    model.type === "minecraft:model" &&
    model.model?.startsWith("minecraft:block/")
  ) {
    return resolveCube(model.model);
  }
  return null;
};

const faceStyle = (image: string, transform: string, brightness: number) => ({
  position: "absolute" as const,
  width: CUBE_SIZE,
  height: CUBE_SIZE,
  backgroundImage: `url(${image})`,
  backgroundSize: "100% 100%",
  imageRendering: "pixelated" as const,
  filter: `brightness(${brightness})`,
  transform
});

const BlockIcon = ({ faces }: { faces: BlockFaces }) => {
  const half = CUBE_SIZE / 2;
  return (
    <div
      style={{
        width: CUBE_SIZE,
        height: CUBE_SIZE,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: "rotateX(-30deg) rotateY(-45deg)"
      }}
    >
      <div
        style={faceStyle(faces.up, `rotateX(90deg) translateZ(${half}px)`, 1)}
      />
      <div style={faceStyle(faces.north, `translateZ(${half}px)`, 0.8)} />
      <div
        style={faceStyle(
          faces.east,
          `rotateY(90deg) translateZ(${half}px)`,
          0.6
        )}
      />
    </div>
  );
};

const SlotIcon = ({ type }: { type: string }) => {
  const id = type.replace(/^minecraft:/, "");
  const { data: faces, isLoading } = useQuery({
    queryKey: ["minecraft-block-faces", id],
    queryFn: () => fetchBlockFaces(id),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false
  });

  if (isLoading) return null;
  if (faces) return <BlockIcon faces={faces} />;
  return <ItemIcon type={type} />;
};

const ItemIcon = ({ type }: { type: string }) => {
  const id = type.replace(/^minecraft:/, "");
  const sources = [
    `${TEXTURE_BASE}/item/${id}.png`,
    `${TEXTURE_BASE}/block/${id}.png`
  ];
  const [attempt, setAttempt] = useState(0);

  if (attempt >= sources.length) {
    return (
      <Typography
        level="body-xs"
        css={{
          textAlign: "center",
          lineHeight: 1.1,
          fontSize: 10,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word"
        }}
      >
        {itemName(type)}
      </Typography>
    );
  }

  return (
    <img
      src={sources[attempt]}
      alt={itemName(type)}
      draggable={false}
      onError={() => setAttempt((n) => n + 1)}
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        imageRendering: "pixelated"
      }}
    />
  );
};

const Slot = ({ item }: { item?: InventorySlot }) => {
  const app = useAppStore();
  const cell = (
    <Paper
      elevation={app.settings?.preferEmbossed ? 3 : 1}
      borderRadius={6}
      direction="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      p={0.5}
    >
      {item && (
        <>
          <SlotIcon key={item.type} type={item.type} />
          {item.amount > 1 && (
            <Typography
              level="body-xs"
              weight="bold"
              css={{
                position: "absolute",
                right: 4,
                bottom: 2,
                textShadow: "1px 1px 0 #000"
              }}
            >
              {item.amount}
            </Typography>
          )}
        </>
      )}
    </Paper>
  );

  if (!item) return cell;

  return (
    <Tooltip content={`${itemName(item.type)} ×${item.amount}`} placement="top">
      {cell}
    </Tooltip>
  );
};

const SlotGrid = ({
  slots,
  indexes,
  columns = 9
}: {
  slots: InventorySlot[];
  indexes: number[];
  columns?: number;
}) => {
  const bySlot = new Map(slots.map((item) => [item.slot, item]));
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
        gridAutoRows: `${SLOT_SIZE}px`,
        gap: 4
      }}
    >
      {indexes.map((index) => (
        <Slot key={index} item={bySlot.get(index)} />
      ))}
    </div>
  );
};

const ServerInventory = ({
  snapshot,
  live
}: {
  snapshot: BridgeInventory;
  live: boolean;
}) => {
  const { t } = useTranslation("settings");

  return (
    <Stack direction="column" spacing={3}>
      <Typography level="body-xs" textColor="muted">
        {snapshot.serverId} ·{" "}
        {live
          ? t("minecraftBridge.inventoryLive")
          : t("minecraftBridge.inventoryLastSeen", {
              time: new Date(snapshot.capturedAt).toLocaleString()
            })}
      </Typography>

      <Typography level="label-sm">
        {t("minecraftBridge.inventoryArmor")}
      </Typography>
      <SlotGrid
        slots={snapshot.inventory}
        indexes={[39, 38, 37, 36, 40]}
        columns={5}
      />

      <Typography level="label-sm">
        {t("minecraftBridge.inventoryMain")}
      </Typography>
      <SlotGrid slots={snapshot.inventory} indexes={range(9, 35)} />
      <SlotGrid slots={snapshot.inventory} indexes={range(0, 8)} />

      <Typography level="label-sm">
        {t("minecraftBridge.inventoryEnderChest")}
      </Typography>
      <SlotGrid slots={snapshot.enderChest} indexes={range(0, 26)} />
    </Stack>
  );
};

interface InventoryViewProps {
  name: string;
  minecraftUuid?: string;
  inventories: BridgeInventory[];
  isLoading: boolean;
  live: boolean;
  emptyMessage: string | null;
  actions?: ReactNode;
}

const InventoryView = observer(
  ({
    name,
    minecraftUuid,
    inventories,
    isLoading,
    live,
    emptyMessage,
    actions
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
              />
            ))}
          </Stack>
          {minecraftUuid && <PlayerModel uuid={minecraftUuid} />}
        </Stack>
        <Typography level="body-xs" textColor="muted">
          {t("minecraftBridge.inventoryDisclaimer")}
        </Typography>
      </Paper>
    );
  }
);

export const BridgeInventoryModal = observer(
  ({ bridgeId }: { bridgeId: string }) => {
    const { t } = useTranslation("settings");
    const { link, inventories, isLoading, live } =
      useMyBridgeInventory(bridgeId);

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
