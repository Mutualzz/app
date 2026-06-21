import {
  useProfileCanvasScale,
  useProfileDesignCanvasRect
} from "@components/Profile/shared/ProfileCanvasViewport";
import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";
import { useEffect, type ReactNode } from "react";

interface LayerProps {
  children: (ctx: {
    canvasRect: CanvasRect;
    canvasScale: number;
  }) => ReactNode;
}

export function ProfileCanvasBlocksLayer({ children }: LayerProps) {
  const { canvasRect, isCanvasReady } = useProfileDesignCanvasRect();
  const canvasScale = useProfileCanvasScale();

  if (!isCanvasReady || !canvasRect) return null;

  return children({ canvasRect, canvasScale });
}

interface ReporterProps {
  onCanvasRectChange?: (rect: CanvasRect) => void;
  onViewportScaleChange?: (scale: number) => void;
}

export function ProfileCanvasRectReporter({
  onCanvasRectChange,
  onViewportScaleChange
}: ReporterProps) {
  const { canvasRect, isCanvasReady } = useProfileDesignCanvasRect();
  const canvasScale = useProfileCanvasScale();

  useEffect(() => {
    if (!canvasRect || !isCanvasReady) return;
    onCanvasRectChange?.(canvasRect);
  }, [canvasRect, isCanvasReady, onCanvasRectChange]);

  useEffect(() => {
    onViewportScaleChange?.(canvasScale);
  }, [canvasScale, onViewportScaleChange]);

  return null;
}
