import { Typography } from "@mutualzz/ui-web";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { itemName } from "./inventoryUtils";

const ICON_SIZE = 32;
const ASSET_ROOT = "https://assets.mcasset.cloud/26.1.2/assets/minecraft";
const TEXTURE_BASE = `${ASSET_ROOT}/textures`;
const CUBE_SIZE = 20;

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

export const SlotIcon = ({ type }: { type: string }) => {
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
