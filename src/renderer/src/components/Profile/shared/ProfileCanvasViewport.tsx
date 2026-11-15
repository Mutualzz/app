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
  useLayoutEffect,
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
  contentHeight?: number;
}

export function ProfileCanvasViewport({
  children,
  zoom,
  canvasRef,
  contentHeight = 0
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
      const width = node.clientWidth;
      const height = node.clientHeight;
      if (width <= 0 || height <= 0) return;
      setContainerSize((prev) =>
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

  const forwardedRef = useRef(canvasRef);
  useLayoutEffect(() => {
    forwardedRef.current = canvasRef;
  });

  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    const ref = forwardedRef.current;
    if (typeof ref === "function") {
      ref(node);
      return;
    }
    if (ref && typeof ref === "object") {
      ref.current = node;
    }
  }, []);

  const effectiveZoom =
    zoom ??
    (containerSize
      ? Math.min(1, containerSize.width / PROFILE_CANVAS_REF_WIDTH)
      : 1);
  const screenHeight = containerSize
    ? Math.floor(containerSize.height / effectiveZoom)
    : 0;
  const canvasHeight = Math.max(
    screenHeight,
    (contentHeight / 100) * PROFILE_CANVAS_REF_WIDTH
  );
  const scaledWidth = PROFILE_CANVAS_REF_WIDTH * effectiveZoom;
  const leftOffset = containerSize
    ? Math.max(0, (containerSize.width - scaledWidth) / 2)
    : 0;

  const canvasRect = useMemo<CanvasRect | null>(
    () =>
      containerSize
        ? { width: PROFILE_CANVAS_REF_WIDTH, height: screenHeight }
        : null,
    [containerSize, screenHeight]
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
      css={{ overflow: "auto", scrollbarGutter: "stable" }}
    >
      <div
        css={{
          position: "relative",
          width: leftOffset + scaledWidth,
          height: Math.floor(canvasHeight * effectiveZoom)
        }}
      >
        <Box
          ref={mergedRef}
          css={{
            position: "absolute",
            top: 0,
            left: `${leftOffset}px`,
            width: `${PROFILE_CANVAS_REF_WIDTH}px`,
            height: `${canvasHeight}px`,
            transform:
              effectiveZoom !== 1 ? `scale(${effectiveZoom})` : undefined,
            transformOrigin: "top left"
          }}
        >
          <ProfileCanvasScaleContext.Provider value={effectiveZoom}>
            <ProfileCanvasRectContext.Provider value={canvasRect}>
              {children}
            </ProfileCanvasRectContext.Provider>
          </ProfileCanvasScaleContext.Provider>
        </Box>
      </div>
    </Box>
  );
}
