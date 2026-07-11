import { Button } from "@components/Button";
import type { ColorLike } from "@mutualzz/ui-core";
import type { APIProfileBlock, ProfileDrawBlock } from "@mutualzz/types";
import { InputColor, Slider, Stack, Typography } from "@mutualzz/ui-web";
import { EraserIcon, PaintBrushIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef
} from "react-sketch-canvas";

const DEFAULT_CANVAS_SIZE = 380;

const processExportedSvg = (svg: string): string => {
  const w = svg.match(/<svg[^>]+\s+width="(\d+(?:\.\d+)?)"/)?.[1];
  const h = svg.match(/<svg[^>]+\s+height="(\d+(?:\.\d+)?)"/)?.[1];
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const clean = attrs
      .replace(/\s+width="[^"]*"/, "")
      .replace(/\s+height="[^"]*"/, "")
      .replace(/\s+viewBox="[^"]*"/, "");
    return `<svg${clean} viewBox="0 0 ${w ?? DEFAULT_CANVAS_SIZE} ${h ?? DEFAULT_CANVAS_SIZE}">`;
  });
};

interface Props {
  block: ProfileDrawBlock;
  updateBlock: (patch: Partial<APIProfileBlock>) => void;
  onApply?: () => void;
}

export const ProfileDrawBlockEditor = ({
  block,
  updateBlock,
  onApply
}: Props) => {
  const { t } = useTranslation("common");
  const { t: tSettings } = useTranslation("settings");
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
  const [brushColor, setBrushColor] = useState<ColorLike>("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<ColorLike>(
    (block.backgroundColor ?? "#1a1a2e") as ColorLike
  );
  const [size, setSize] = useState(6);
  const [eraserMode, setEraserMode] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const loaded = useRef(false);
  const sizeInitialized = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 10 && !sizeInitialized.current) {
        sizeInitialized.current = true;
        setCanvasSize(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (loaded.current || !block.paths) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.loadPaths(JSON.parse(block.paths));
      loaded.current = true;
      setIsEmpty(false);
    } catch {
      /* malformed paths — start fresh */
    }
  }, [block.paths, canvasSize]);

  const toggleEraser = () => {
    const next = !eraserMode;
    setEraserMode(next);
    canvasRef.current?.eraseMode(next);
  };

  const apply = async () => {
    const svgRaw = await canvasRef.current?.exportSvg();
    const paths = await canvasRef.current?.exportPaths();
    if (!svgRaw || !paths) return;
    updateBlock({
      svgData: processExportedSvg(svgRaw),
      paths: JSON.stringify(paths),
      backgroundColor
    } as Partial<APIProfileBlock>);
    onApply?.();
  };

  return (
    <Stack direction="column" spacing={1.25}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="sm"
          color="neutral"
          startDecorator={
            eraserMode ? (
              <EraserIcon weight="fill" />
            ) : (
              <PaintBrushIcon weight="fill" />
            )
          }
          onClick={toggleEraser}
        >
          {eraserMode
            ? tSettings("profile.draw.eraser")
            : tSettings("profile.draw.brush")}
        </Button>
        <Stack direction="row" spacing={0.75} alignItems="center" flex={1}>
          <Slider
            min={1}
            max={40}
            value={size}
            onChange={(_, value) => setSize(Number(value))}
            valueLabelDisplay="auto"
          />
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-around">
        {!eraserMode && (
          <>
            <Stack direction="column" spacing={0.75} alignItems="center">
              <Typography level="body-xs" css={{ opacity: 0.7 }}>
                {tSettings("profile.draw.brush")}
              </Typography>
              <InputColor
                size="sm"
                value={brushColor}
                onChange={setBrushColor}
              />
            </Stack>
          </>
        )}
        <Stack direction="column" spacing={0.75} alignItems="center">
          <Typography level="body-xs" css={{ opacity: 0.7 }}>
            {tSettings("profile.draw.background")}
          </Typography>
          <InputColor
            size="sm"
            value={backgroundColor}
            onChange={setBackgroundColor}
            allowAlpha
          />
        </Stack>
      </Stack>

      <div
        ref={containerRef}
        css={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          background: backgroundColor,
          touchAction: "none",
          userSelect: "none",
          width: "100%",
          aspectRatio: "1"
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          width={`${canvasSize}px`}
          height={`${canvasSize}px`}
          strokeColor={brushColor}
          strokeWidth={size}
          eraserWidth={size}
          canvasColor={backgroundColor}
          withTimestamp
          onStroke={async () => {
            const t = await canvasRef.current?.getSketchingTime();
            setIsEmpty(!t);
          }}
          style={{ border: "none", borderRadius: 0, touchAction: "none" }}
        />
      </div>

      <Stack direction="row" spacing={0.75}>
        <Button
          size="sm"
          color="neutral"
          disabled={isEmpty}
          onClick={() => canvasRef.current?.undo()}
        >
          {t("undo")}
        </Button>
        <Button
          size="sm"
          color="neutral"
          disabled={isEmpty}
          onClick={() => canvasRef.current?.redo()}
        >
          {t("redo")}
        </Button>
        <Button
          size="sm"
          color="danger"
          disabled={isEmpty}
          onClick={() => {
            canvasRef.current?.clearCanvas();
            setIsEmpty(true);
          }}
        >
          {t("clear")}
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={apply}
          css={{ marginLeft: "auto" }}
        >
          {t("apply")}
        </Button>
      </Stack>
    </Stack>
  );
};
