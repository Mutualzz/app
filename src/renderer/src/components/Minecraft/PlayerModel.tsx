import { minecraftSkinUrl } from "@mutualzz/client";
import { useEffect, useRef } from "react";
import type { SkinViewer } from "skinview3d";

const MODEL_WIDTH = 180;
const MODEL_HEIGHT = 300;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const PlayerModel = ({ uuid }: { uuid: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    void import("skinview3d").then(({ SkinViewer, IdleAnimation }) => {
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
      window.addEventListener("mousemove", onMove);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("mousemove", onMove);
      viewer?.dispose();
    };
  }, [uuid]);

  return <canvas ref={canvasRef} />;
};
