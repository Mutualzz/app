import {
  PROFILE_CANVAS_REF_WIDTH,
  type CanvasRect
} from "@components/Profile/viewer/profileLayout.utils";
import { Box } from "@mutualzz/ui-web";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  zoom?: number;
  canvasRef?: Ref<HTMLDivElement>;
}

export function ProfileCanvasViewport({
  children,
  zoom = 1,
  canvasRef
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      const { width, height } = node.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      setContainerSize(prev =>
        prev?.width === width && prev?.height === height
          ? prev
          : { width, height }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof canvasRef === "function") canvasRef(node);
      else if (canvasRef)
        (canvasRef as { current: HTMLDivElement | null }).current = node;
    },
    [canvasRef]
  );

  // Center the fixed-width canvas on wide viewports; clip on narrow ones.
  const leftOffset = containerSize
    ? Math.max(0, (containerSize.width - PROFILE_CANVAS_REF_WIDTH) / 2)
    : 0;

  // Canvas is always the reference width — no fitScale, no responsive scaling.
  const canvasRect = useMemo<CanvasRect | null>(
    () =>
      containerSize
        ? { width: PROFILE_CANVAS_REF_WIDTH, height: containerSize.height }
        : null,
    [containerSize?.width, containerSize?.height]
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
        css={{
          position: "absolute",
          top: 0,
          left: `${leftOffset}px`,
          width: `${PROFILE_CANVAS_REF_WIDTH}px`,
          height: "100%",
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
