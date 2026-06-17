import { useCallback, useEffect, useRef, useState } from "react";
import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";

export function useProfileCanvasRect(onChange?: (rect: CanvasRect) => void) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [canvasRect, setCanvasRect] = useState<CanvasRect | null>(null);

  const canvasRef = useCallback((node: HTMLDivElement | null) => {
    if (nodeRef.current === node) return;

    observerRef.current?.disconnect();
    observerRef.current = null;
    nodeRef.current = node;

    if (!node) {
      setCanvasRect(null);
      return;
    }

    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const next = { width, height };
      setCanvasRect(next);
      onChange?.(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observerRef.current = observer;
  }, [onChange]);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return {
    canvasRef,
    canvasRect,
    isCanvasReady: canvasRect !== null
  };
}
