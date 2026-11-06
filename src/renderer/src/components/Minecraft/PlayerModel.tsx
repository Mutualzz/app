import { minecraftSkinUrl } from "@mutualzz/client";
import { useEffect, useRef, useState } from "react";
import type { SkinViewer } from "skinview3d";
import { attachArmor, type ArmorPieces } from "./armor";
import type * as Three from "three";

const MODEL_WIDTH = 180;
const MODEL_HEIGHT = 300;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const PlayerModel = ({
  uuid,
  armor
}: {
  uuid: string;
  armor?: ArmorPieces;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);
  const threeRef = useRef<typeof Three | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let viewer: SkinViewer | null = null;
    let cancelled = false;

    const onMove = (event: MouseEvent) => {
      if (!viewer) return;
      const rect = canvas.getBoundingClientRect();
      const dx =
        (event.clientX - (rect.left + rect.width / 2)) / window.innerWidth;
      const dy =
        (event.clientY - (rect.top + rect.height * 0.15)) / window.innerHeight;

      viewer.playerObject.rotation.y = clamp(dx * 1.2, -0.5, 0.5);
      viewer.playerObject.skin.head.rotation.y = clamp(dx * 2, -0.6, 0.6);
      viewer.playerObject.skin.head.rotation.x = clamp(dy * 2, -0.6, 0.6);
    };

    void Promise.all([import("skinview3d"), import("three")]).then(
      ([{ SkinViewer, IdleAnimation }, three]) => {
        if (cancelled) return;
        viewer = new SkinViewer({
          canvas,
          width: MODEL_WIDTH,
          height: MODEL_HEIGHT,
          skin: minecraftSkinUrl(uuid),
          enableControls: false,
          zoom: 0.85
        });
        viewer.animation = new IdleAnimation();
        viewerRef.current = viewer;
        threeRef.current = three;
        setReady(true);
        window.addEventListener("mousemove", onMove);
      }
    );

    return () => {
      cancelled = true;
      setReady(false);
      viewerRef.current = null;
      window.removeEventListener("mousemove", onMove);
      viewer?.dispose();
    };
  }, [uuid]);

  const armorKey = JSON.stringify(armor ?? {});

  useEffect(() => {
    const viewer = viewerRef.current;
    const three = threeRef.current;
    if (!ready || !viewer || !three) return;
    return attachArmor(
      three,
      viewer.playerObject.skin,
      JSON.parse(armorKey) as ArmorPieces
    );
  }, [ready, armorKey]);

  return <canvas ref={canvasRef} />;
};
