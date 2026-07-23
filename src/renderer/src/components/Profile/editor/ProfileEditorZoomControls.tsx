import { IconButton } from "@components/IconButton";
import { Paper } from "@components/Paper";
import { Tooltip } from "@components/Tooltip";
import { useAppStore } from "@hooks/useStores";
import { formatColor } from "@mutualzz/ui-core";
import { Stack, Typography, useTheme } from "@mutualzz/ui-web";
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsInIcon,
  GridFourIcon,
  SidebarIcon
} from "@phosphor-icons/react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

export const PROFILE_EDITOR_MIN_ZOOM = 0.72;
export const PROFILE_EDITOR_MAX_ZOOM = 1;
export const PROFILE_EDITOR_ZOOM_STEP = 0.04;
export const PROFILE_EDITOR_DEFAULT_ZOOM = 0.88;

export const PROFILE_GRID_STEP_OPTIONS = [1, 2, 4, 5, 8] as const;
export type ProfileGridStep = (typeof PROFILE_GRID_STEP_OPTIONS)[number];

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
  panelsVisible: boolean;
  setPanelsVisible: (visible: boolean) => void;
  zoom: number;
  fitZoom: number;
  onZoomChange: (zoom: number) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  gridStep?: number;
  onGridStepChange?: (step: number) => void;
}

export const ProfileEditorZoomControls = observer(
  ({
    panelsVisible,
    setPanelsVisible,
    zoom,
    fitZoom,
    onZoomChange,
    snapToGrid,
    onSnapToGridChange,
    gridStep = 4,
    onGridStepChange
  }: Props) => {
    const { t } = useTranslation("settings");
    const app = useAppStore();
    const { theme } = useTheme();
    const primarySoftBg = formatColor(theme.colors.primary, {
      alpha: 10,
      format: "hexa"
    });
    const neutralSoftBg = formatColor(theme.colors.neutral, {
      alpha: 10,
      format: "hexa"
    });
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
          zIndex: theme.zIndex.modal,
          WebkitAppRegion: "no-drag"
        }}
      >
        <Tooltip
          content={
            panelsVisible
              ? t("profile.inspector.zoom.hidePanels")
              : t("profile.inspector.zoom.showPanels")
          }
        >
          <IconButton
            size="sm"
            variant="plain"
            onClick={() => setPanelsVisible(!panelsVisible)}
            title={
              panelsVisible
                ? t("profile.inspector.zoom.hidePanels")
                : t("profile.inspector.zoom.showPanels")
            }
          >
            <SidebarIcon weight={panelsVisible ? "fill" : "regular"} />
          </IconButton>
        </Tooltip>

        <Tooltip content={t("profile.inspector.zoom.zoomOut")}>
          <IconButton
            size="sm"
            variant="plain"
            disabled={zoom <= PROFILE_EDITOR_MIN_ZOOM + 0.001}
            onClick={() =>
              onZoomChange(
                clampProfileEditorZoom(zoom - PROFILE_EDITOR_ZOOM_STEP)
              )
            }
            title={t("profile.inspector.zoom.zoomOut")}
          >
            <MagnifyingGlassMinusIcon />
          </IconButton>
        </Tooltip>

        <Typography
          level="body-xs"
          fontFamily="monospace"
          css={{ minWidth: 40, textAlign: "center", opacity: 0.8 }}
        >
          {Math.round(zoom * 100)}%
        </Typography>

        <Tooltip content={t("profile.inspector.zoom.zoomIn")}>
          <IconButton
            size="sm"
            variant="plain"
            disabled={zoom >= PROFILE_EDITOR_MAX_ZOOM - 0.001}
            onClick={() =>
              onZoomChange(
                clampProfileEditorZoom(zoom + PROFILE_EDITOR_ZOOM_STEP)
              )
            }
            title={t("profile.inspector.zoom.zoomIn")}
          >
            <MagnifyingGlassPlusIcon />
          </IconButton>
        </Tooltip>

        <Tooltip content={t("profile.inspector.zoom.fitToEditor")}>
          <IconButton
            size="sm"
            variant="plain"
            disabled={Math.abs(zoom - fitZoom) < 0.01}
            onClick={() => onZoomChange(fitZoom)}
            title={t("profile.inspector.zoom.fitToEditor")}
          >
            <ArrowsInIcon />
          </IconButton>
        </Tooltip>

        {onSnapToGridChange && (
          <>
            <Tooltip content={t("profile.blocks.snapToGrid")}>
              <IconButton
                size="sm"
                variant={snapToGrid ? "soft" : "plain"}
                color={snapToGrid ? "primary" : undefined}
                onClick={() => onSnapToGridChange(!snapToGrid)}
                title={t("profile.blocks.snapToGrid")}
              >
                <GridFourIcon weight={snapToGrid ? "fill" : "regular"} />
              </IconButton>
            </Tooltip>

            {snapToGrid && onGridStepChange && (
              <Stack direction="row" spacing={0.25}>
                {PROFILE_GRID_STEP_OPTIONS.map((step) => (
                  <Tooltip
                    key={step}
                    content={t("profile.inspector.zoom.gridStep", { step })}
                  >
                    <Typography
                      level="body-xs"
                      fontFamily="monospace"
                      onClick={() => onGridStepChange(step)}
                      css={{
                        minWidth: 22,
                        textAlign: "center",
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: gridStep === step ? 700 : 400,
                        opacity: gridStep === step ? 1 : 0.45,
                        background:
                          gridStep === step
                            ? primarySoftBg
                            : "transparent",
                        color:
                          gridStep === step
                            ? theme.colors.primary
                            : undefined,
                        "&:hover": {
                          opacity: 1,
                          background: neutralSoftBg
                        }
                      }}
                    >
                      {step}
                    </Typography>
                  </Tooltip>
                ))}
              </Stack>
            )}
          </>
        )}
      </Paper>
    );
  }
);
