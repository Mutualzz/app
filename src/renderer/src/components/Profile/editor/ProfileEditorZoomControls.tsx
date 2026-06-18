import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { useAppStore } from "@hooks/useStores";
import { Typography } from "@mutualzz/ui-web";
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsInIcon,
  GridFourIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";

export const PROFILE_EDITOR_MIN_ZOOM = 0.72;
export const PROFILE_EDITOR_MAX_ZOOM = 1;
export const PROFILE_EDITOR_ZOOM_STEP = 0.04;
export const PROFILE_EDITOR_DEFAULT_ZOOM = 0.88;

export const clampProfileEditorZoom = (value: number) =>
  Math.min(
    PROFILE_EDITOR_MAX_ZOOM,
    Math.max(PROFILE_EDITOR_MIN_ZOOM, Math.round(value * 100) / 100)
  );

export const computeProfileEditorFitZoom = (width: number, height: number) => {
  if (width <= 0 || height <= 0) return PROFILE_EDITOR_DEFAULT_ZOOM;

  const margin = 40;
  const fit = Math.min(
    (width - margin) / width,
    (height - margin) / height,
    PROFILE_EDITOR_MAX_ZOOM
  );

  return clampProfileEditorZoom(fit);
};

interface Props {
  zoom: number;
  fitZoom: number;
  onZoomChange: (zoom: number) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
}

export const ProfileEditorZoomControls = observer(
  ({ zoom, fitZoom, onZoomChange, snapToGrid, onSnapToGridChange }: Props) => {
    const app = useAppStore();
    const embossed = app.settings?.preferEmbossed;

    return (
      <Paper
        direction="row"
        alignItems="center"
        spacing={0.75}
        px={1}
        py={0.75}
        borderRadius={999}
        variant="plain"
        elevation={embossed ? 3 : 1}
        boxShadow="none !important"
        css={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          WebkitAppRegion: "no-drag"
        }}
      >
        <IconButton
          size="sm"
          variant="plain"
          disabled={zoom <= PROFILE_EDITOR_MIN_ZOOM + 0.001}
          onClick={() =>
            onZoomChange(
              clampProfileEditorZoom(zoom - PROFILE_EDITOR_ZOOM_STEP)
            )
          }
          title="Zoom out"
        >
          <MagnifyingGlassMinusIcon />
        </IconButton>

        <Typography
          level="body-xs"
          fontFamily="monospace"
          css={{ minWidth: 40, textAlign: "center", opacity: 0.8 }}
        >
          {Math.round(zoom * 100)}%
        </Typography>

        <IconButton
          size="sm"
          variant="plain"
          disabled={zoom >= PROFILE_EDITOR_MAX_ZOOM - 0.001}
          onClick={() =>
            onZoomChange(
              clampProfileEditorZoom(zoom + PROFILE_EDITOR_ZOOM_STEP)
            )
          }
          title="Zoom in"
        >
          <MagnifyingGlassPlusIcon />
        </IconButton>

        <IconButton
          size="sm"
          variant="plain"
          disabled={Math.abs(zoom - fitZoom) < 0.01}
          onClick={() => onZoomChange(fitZoom)}
          title="Fit to editor"
        >
          <ArrowsInIcon />
        </IconButton>

        {onSnapToGridChange && (
          <IconButton
            size="sm"
            variant={snapToGrid ? "soft" : "plain"}
            color={snapToGrid ? "primary" : undefined}
            onClick={() => onSnapToGridChange(!snapToGrid)}
            title="Snap to grid"
          >
            <GridFourIcon weight={snapToGrid ? "fill" : "regular"} />
          </IconButton>
        )}
      </Paper>
    );
  }
);
