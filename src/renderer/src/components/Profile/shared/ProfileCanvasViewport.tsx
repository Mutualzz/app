import type { CanvasRect } from "@components/Profile/viewer/profileLayout.utils";
import { Box } from "@mutualzz/ui-web";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type Ref
} from "react";

const ProfileCanvasRectContext = createContext<CanvasRect | null>(null);
const ProfileCanvasScaleContext = createContext(1);

export function useProfileDesignCanvasRect() {
  const canvasRect = useContext(ProfileCanvasRectContext);
  return {
    canvasRect,
    isCanvasReady: canvasRect !== null && canvasRect.width > 0
  };
}

export function useProfileCanvasScale() {
  return useContext(ProfileCanvasScaleContext);
}

interface Props extends PropsWithChildren {
  /** Visual zoom only — layout coordinates stay in the measured canvas space. */
  zoom?: number;
  canvasRef?: Ref<HTMLDivElement>;
}

export function ProfileCanvasViewport({
  children,
  zoom = 1,
  canvasRef
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<CanvasRect | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setCanvasRect({ width, height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof canvasRef === "function") canvasRef(node);
      else if (canvasRef) canvasRef.current = node;
    },
    [canvasRef]
  );

  return (
    <Box
      ref={containerRef}
      flex={1}
      minWidth={0}
      minHeight={0}
      width="100%"
      height="100%"
      position="relative"
      overflow="hidden"
    >
      <Box
        ref={mergedRef}
        width="100%"
        height="100%"
        position="relative"
        css={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
          transformOrigin: "center center"
        }}
      >
        <ProfileCanvasScaleContext.Provider value={zoom}>
          <ProfileCanvasRectContext.Provider value={canvasRect}>
            {children}
          </ProfileCanvasRectContext.Provider>
        </ProfileCanvasScaleContext.Provider>
      </Box>
    </Box>
  );
}
